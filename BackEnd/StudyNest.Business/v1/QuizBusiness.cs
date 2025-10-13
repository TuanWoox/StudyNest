using Hangfire;
﻿using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.VisualBasic;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class QuizBusiness : IQuizBusiness
    {
        private readonly ILlmQuizGenerator _llm;
        private readonly ApplicationDbContext _context;
        private readonly IUserContext _userContext;
        private readonly IRepository<Quiz, string> _repository;
        private readonly IMapper _mapper;
        private readonly int MaxQuestions = 20;
        public QuizBusiness(ILlmQuizGenerator llm, ApplicationDbContext context, IUserContext userContext, IRepository<Quiz,string> repository, IMapper mapper)
        {
            this._llm = llm;
            this._context = context;
            this._userContext = userContext;
            this._repository = repository;
            this._mapper = mapper;
        }

        public async Task<ReturnResult<object>> GenerateAsync(CreateQuizDTO dto)
        {
            var result = new ReturnResult<object>();
            var total = (dto?.Count_Mcq ?? 0) + (dto?.Count_Tf ?? 0) + (dto?.Count_Msq ?? 0);

            if (dto is null)
            {
                result.Message = "The request data is missing or invalid.";
                return result;
            }
            if ((dto.Count_Mcq < 0) || (dto.Count_Tf < 0) || (dto.Count_Msq < 0))
            {
                result.Message = "Each question type count must be a non-negative number.";
                return result;
            }
            if (total <= 0)
            {
                result.Message = "Please specify at least one question to generate.";
                return result;
            }
            if (total > MaxQuestions)
            {
                result.Message = $"You can only generate up to {MaxQuestions} questions at a time.";
                return result;
            }

            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.Id == dto.NoteId);
            if (note is null)
            {
                result.Message = "The selected note could not be found. Please check and try again.";
                return result;
            }
            dto.NoteContent = note.Content;

            try
            {
                var newQuiz = await _llm.GenerateAsync(dto);
                if (newQuiz is null || newQuiz.Questions is null || newQuiz.Questions.Count == 0)
                {
                    result.Message = "The note is insufficient or meaningless. Quiz was not created.";
                    return result;
                }
                // Initially Mark That We Are Converting This Quiz To A Snapshot
                newQuiz.IsBeingConvertToSnapShot = true;
                await _context.AddAsync(newQuiz);
                await _context.SaveChangesAsync();
                result.Result = new {id = newQuiz.Id.ToString() };
                // Enqueue A Background Job To Convert This Quiz To A Snapshot
                BackgroundJob.Enqueue<IQuizAttemptSnapshotBusiness>(x => x.CreateSnapShot(newQuiz.Id.ToString().Trim()));
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }

        public async Task<ReturnResult<PagedData<QuizListDTO, string>>> GetAllQuizByUserId(Page<string> page, bool isExported = false)
        {
            var rs = new ReturnResult<PagedData<QuizListDTO, string>>();
            try
            {
                var query = _context.Quizzes
                    .Where(n => n.OwnerId == _userContext.UserId)
                    .Include(x => x.Questions)
                    .AsNoTracking()
                    .OrderByDescending(q => q.DateCreated ?? DateTimeOffset.MinValue)
                    .AsQueryable();
                rs.Result = await _repository.GetPagingAsync<Page<string>, QuizListDTO>(query, page, isExported);
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }

        public async Task<ReturnResult<Quiz>> GetQuizDetail(string id)
        {
            var rs = new ReturnResult<Quiz>();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    rs.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "quiz id");
                    return rs;
                }
                var quiz = await _context.Quizzes
                    .Where(q => q.Id == id)
                    .Include(q => q.Questions)
                        .ThenInclude(qn => qn.Choices)
                    .FirstOrDefaultAsync();
                if (quiz is null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", id);
                    return rs;
                }
                rs.Result = quiz;
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }

        public async Task<ReturnResult<bool>> UpdateQuiz(UpdateQuizDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var existingQuiz = await _context.Quizzes
                    .Include(q => q.Questions)
                        .ThenInclude(x => x.Choices)
                    .FirstOrDefaultAsync(q => q.Id == request.Id && q.OwnerId == _userContext.UserId);

                if (existingQuiz is null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "Quiz", request.Id);
                    return rs;
                }

                if (request.Questions is null || request.Questions.Count == 0)
                {
                    rs.Message = "Quiz cannot have empty question";
                    return rs;
                }

                existingQuiz.Title = request.Title?.Trim() ?? existingQuiz.Title;

                var incomingQuestions = request.Questions;

                // ---- REMOVE questions not present anymore (by Id) ----
                var incomingIds = new HashSet<string>(
                    incomingQuestions.Where(q => !string.IsNullOrWhiteSpace(q.Id)).Select(q => q.Id!),
                    StringComparer.OrdinalIgnoreCase
                );

                var removeQuestions = existingQuiz.Questions
                    .Where(q => !incomingIds.Contains(q.Id))
                    .ToList();
                _context.Questions.RemoveRange(removeQuestions);

                // ---- ADD / UPDATE questions ----
                foreach (var qDto in incomingQuestions)
                {
                    // 1) Build temp choice list for validation (không ép Id/QuestionId)
                    var choicesForValidate = (qDto.Choices ?? new List<ChoiceUpsertDTO>())
                        .Select(c => new Choice { Text = c.Text, IsCorrect = c.IsCorrect })
                        .ToList();

                    // 2) Validate per-question (re-use validator)
                    var v = QuestionBusiness.ValidateQuestion(qDto.Name, qDto.Type, qDto.Explanation ?? string.Empty, choicesForValidate);
                    if (!string.IsNullOrEmpty(v)) { rs.Message = v; return rs; }

                    if (string.IsNullOrWhiteSpace(qDto.Id))
                    {
                        // NEW Question
                        var newQ = new Question
                        {
                            QuizId = existingQuiz.Id,
                            Name = qDto.Name,
                            Type = qDto.Type,
                            Explanation = qDto.Explanation ?? string.Empty,
                            Choices = (qDto.Choices ?? new())
                                .Select(c => new Choice
                                {
                                    Text = c.Text,
                                    IsCorrect = c.IsCorrect
                                })
                                .ToList()
                        };
                        existingQuiz.Questions.Add(newQ);
                    }
                    else
                    {
                        // UPDATE Question
                        var qEntity = existingQuiz.Questions.FirstOrDefault(x => x.Id == qDto.Id);
                        if (qEntity is null) continue; // hoặc báo lỗi "Question not found in quiz"

                        // Phòng payload lẫn quiz
                        if (!string.Equals(qEntity.QuizId, existingQuiz.Id, StringComparison.OrdinalIgnoreCase))
                        {
                            rs.Message = "Question does not belong to this quiz.";
                            return rs;
                        }

                        // Scalars
                        qEntity.Name = qDto.Name;
                        qEntity.Type = qDto.Type;
                        qEntity.Explanation = qDto.Explanation ?? string.Empty;

                        // ---- DIFF Choices (remove / add / update) ----
                        var incomingChoices = qDto.Choices ?? new List<ChoiceUpsertDTO>();

                        // a) Remove choices không còn trong incoming
                        var incomingChoiceIds = new HashSet<string>(
                            incomingChoices.Where(c => !string.IsNullOrWhiteSpace(c.Id)).Select(c => c.Id!),
                            StringComparer.OrdinalIgnoreCase
                        );

                        var toRemoveChoices = qEntity.Choices
                            .Where(c => !incomingChoiceIds.Contains(c.Id))
                            .ToList();
                        _context.Choices.RemoveRange(toRemoveChoices);

                        // b) Add or Update
                        foreach (var cDto in incomingChoices)
                        {
                            if (string.IsNullOrWhiteSpace(cDto.Id))
                            {
                                // Add
                                qEntity.Choices.Add(new Choice
                                {
                                    QuestionId = qEntity.Id,
                                    Text = cDto.Text,
                                    IsCorrect = cDto.IsCorrect
                                });
                            }
                            else
                            {
                                // Update
                                var cEntity = qEntity.Choices.FirstOrDefault(c => c.Id == cDto.Id);
                                if (cEntity is null) continue;
                                cEntity.Text = cDto.Text;
                                cEntity.IsCorrect = cDto.IsCorrect;
                            }
                        }
                    }
                }

                rs.Result = await _context.SaveChangesAsync() > 0;
                if (!rs.Result)
                {
                    rs.Message = "Quiz was not updated. Please try again.";
                }
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }


        public async Task<ReturnResult<bool>> DeleteById(string id)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    rs.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "quiz id");
                    return rs;
                }
                var quizToDelete = await _context.Quizzes.Where(x => x.Id == id).ToListAsync();
                if (quizToDelete.Count == 0)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", id);
                    return rs;
                }
                _context.RemoveRange(quizToDelete);

                rs.Result = await _context.SaveChangesAsync() > 0;

                if (!rs.Result)
                    rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return rs;
        }
    }
}
