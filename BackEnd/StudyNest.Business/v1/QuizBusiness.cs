﻿using AutoMapper;
using Hangfire;
using Hangfire.Server;
using Hangfire.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Hubs;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Llm;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Choice;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System.Diagnostics;

namespace StudyNest.Business.v1
{
    public class QuizBusiness : IQuizBusiness
    {
        const int MAX_LENGTH = 20000;
        private readonly ILlmQuizGenerator _llm;
        private readonly ApplicationDbContext _context;
        private readonly IUserContext _userContext;
        private readonly IRepository<Quiz, string> _repository;
        private readonly IMapper _mapper;
        private readonly int MaxQuestions = 20;
        private readonly IHubContext<QuizCreateHub, IQuizCreateHub> _hubContext;
        public QuizBusiness(
            ILlmQuizGenerator llm, 
            ApplicationDbContext context, 
            IUserContext userContext, 
            IRepository<Quiz,string> repository, 
            IMapper mapper,
            IHubContext<QuizCreateHub, 
            IQuizCreateHub> hubContext)
        {
            this._llm = llm;
            this._context = context;
            this._userContext = userContext;
            this._repository = repository;
            this._mapper = mapper;
            this._hubContext = hubContext;
        }

        public async Task<ReturnResult<CreateQuizJobResponseDTO>> EnqueueGenerateAsync(CreateQuizDTO dto)
        {
            var result = new ReturnResult<CreateQuizJobResponseDTO>();
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

            try
            {
                var note = await _context.Notes
                    .FirstOrDefaultAsync(n => n.Id == dto.NoteId && n.OwnerId == _userContext.UserId);

                if (note is null)
                {
                    result.Message = "The selected note could not be found. Please check and try again.";
                    return result;
                }

                // Pass note content to generator
                dto.NoteContent = note.Content;

                var jobId = Guid.NewGuid().ToString();
                var timestamp = DateTimeOffset.UtcNow;

                // Enqueue background job
                var hangfireJobId = BackgroundJob.Enqueue<IQuizBusiness>(x =>
                    x.GenerateQuizInBackground(jobId, dto, _userContext.UserId));

                // Store queryable metadata for this job
                var connection = JobStorage.Current.GetConnection();
                connection.SetJobParameter(hangfireJobId, "CustomJobId", jobId);
                connection.SetJobParameter(hangfireJobId, "UserId", _userContext.UserId);
                connection.SetJobParameter(hangfireJobId, "NoteId", dto.NoteId.ToString());
                connection.SetJobParameter(hangfireJobId, "NoteTitle", note.Title);
                connection.SetJobParameter(hangfireJobId, "Difficulty", dto.Difficulty);
                connection.SetJobParameter(hangfireJobId, "Timestamp", timestamp.ToString("o"));

                // Notify client that creation has started
                await _hubContext.Clients.User(_userContext.UserId)
                    .CreateStarted(jobId, note.Title, timestamp);

                result.Result = new CreateQuizJobResponseDTO
                {
                    JobId = jobId,
                    NoteTitle = note.Title,
                    Timestamp = timestamp
                };
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }

        public async Task GenerateQuizInBackground(string jobId, CreateQuizDTO dto, string userId)
        {
            await GenerateQuizInBackground(jobId, dto, userId, null);
        }

        public async Task GenerateQuizInBackground(string jobId, CreateQuizDTO dto, string userId, PerformContext context = null)
        {
            try
            {
                var newQuiz = await _llm.GenerateAsync(dto, userId);

                if (newQuiz is null || newQuiz.Questions is null || newQuiz.Questions.Count == 0)
                {
                    // Failure
                    await _hubContext.Clients.User(userId).CreateFinished(
                        jobId, false, null, "Note is insufficient or meaningless.");
                    return;
                }
                newQuiz.Difficulty = dto.Difficulty.ToLower().Trim();
                // Save quiz
                newQuiz.IsBeingConvertToSnapShot = true;
                await _context.AddAsync(newQuiz);
                await _context.SaveChangesAsync();

                if (context?.BackgroundJob?.Id != null)
                {
                    var connection = JobStorage.Current.GetConnection();
                    connection.SetJobParameter(context.BackgroundJob.Id, "QuizId", newQuiz.Id.ToString());
                }

                // Enqueue snapshot creation
                BackgroundJob.Enqueue<IQuizAttemptSnapshotBusiness>(x =>
                    x.CreateSnapShot(newQuiz.Id.ToString().Trim()));

                // Success
                await _hubContext.Clients.User(userId).CreateFinished(
                    jobId, true, newQuiz.Id.ToString(), null);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error($"Quiz generation failed for jobId {jobId}: {ex}");
                await _hubContext.Clients.User(userId).CreateFinished(
                    jobId, false, null, "An unexpected error occurred.");
            }
        }
        public async Task<ReturnResult<string>> CreateQuizFromScratch(CreateManualQuizDTO request)
        {
            var rs = new ReturnResult<string>();
            try
            {
                if (request.Questions is null || request.Questions.Count == 0)
                {
                    rs.Message = "Quiz cannot have empty questions.";
                    return rs;
                }

                var newQuiz = new Quiz
                {
                    Title = request.Title.Trim(),
                    Difficulty = request.Difficulty.Trim(),
                    OwnerId = _userContext.UserId,
                    NoteId = null
                };

                foreach (var qDto in request.Questions)
                {
                    var choicesForValidate = (qDto.Choices ?? new())
                        .Select(c => new Choice { Text = c.Text, IsCorrect = c.IsCorrect })
                        .ToList();

                    var validationError = QuestionBusiness.ValidateQuestion(
                        qDto.Name, qDto.Type, qDto.Explanation ?? string.Empty, choicesForValidate);
                    
                    if (!string.IsNullOrEmpty(validationError))
                    {
                        rs.Message = validationError;
                        return rs;
                    }   

                    var newQuestion = new Question
                    {
                        Name = qDto.Name.Trim(),
                        Type = qDto.Type.Trim().ToUpperInvariant(),
                        Explanation = qDto.Explanation?.Trim() ?? string.Empty,
                        Choices = (qDto.Choices ?? new())
                            .Select(c => new Choice
                            {
                                Text = c.Text.Trim(),
                                IsCorrect = c.IsCorrect
                            })
                            .ToList()
                    };
                    newQuiz.Questions.Add(newQuestion);
                }

                _context.Quizzes.Add(newQuiz);
                await _context.SaveChangesAsync();

                rs.Result = newQuiz.Id;
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }
        public async Task<ReturnResult<PagedData<QuizListDTO, string>>> GetAllQuizByUserId(Page<string> page, bool isExported = false)
        {
            var rs = new ReturnResult<PagedData<QuizListDTO, string>>();
            try
            {
                var query = _context.Quizzes
                    .Where(n => n.OwnerId == _userContext.UserId)
                    .Include(x => x.Questions)
                    .Include(n => n.Note)
                    .AsNoTracking()
                    .OrderByDescending(q => q.DateModified ?? DateTimeOffset.MinValue)
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
                quiz.Questions = quiz.Questions
                    .OrderByDescending(q => q.DateModified)
                    .ToList();
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

                var incomingIds = new HashSet<string>(
                    incomingQuestions.Where(q => !string.IsNullOrWhiteSpace(q.Id)).Select(q => q.Id!),
                    StringComparer.OrdinalIgnoreCase
                );

                var removeQuestions = existingQuiz.Questions
                    .Where(q => !incomingIds.Contains(q.Id))
                    .ToList();
                _context.Questions.RemoveRange(removeQuestions);

                foreach (var qDto in incomingQuestions)
                {
                    var choicesForValidate = (qDto.Choices ?? new List<Common.Models.DTOs.EntityDTO.Question.ChoiceDTO>())
                        .Select(c => new Choice { Text = c.Text, IsCorrect = c.IsCorrect })
                        .ToList();

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
                        var qEntity = existingQuiz.Questions.FirstOrDefault(x => x.Id == qDto.Id);
                        if (qEntity is null) continue; 

                        if (!string.Equals(qEntity.QuizId, existingQuiz.Id, StringComparison.OrdinalIgnoreCase))
                        {
                            rs.Message = "Question does not belong to this quiz.";
                            return rs;
                        }

                        qEntity.Name = qDto.Name;
                        qEntity.Type = qDto.Type;
                        qEntity.Explanation = qDto.Explanation ?? string.Empty;

                        var incomingChoices = qDto.Choices;

                        var incomingChoiceIds = new HashSet<string>(
                            incomingChoices.Where(c => !string.IsNullOrWhiteSpace(c.Id)).Select(c => c.Id!),
                            StringComparer.OrdinalIgnoreCase
                        );

                        var toRemoveChoices = qEntity.Choices
                            .Where(c => !incomingChoiceIds.Contains(c.Id))
                            .ToList();
                        _context.Choices.RemoveRange(toRemoveChoices);

                        foreach (var cDto in incomingChoices)
                        {
                            if (string.IsNullOrWhiteSpace(cDto.Id))
                            {
                                qEntity.Choices.Add(new Choice
                                {
                                    QuestionId = qEntity.Id,
                                    Text = cDto.Text,
                                    IsCorrect = cDto.IsCorrect
                                });
                            }
                            else
                            {
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

        public async Task<ReturnResult<bool>> ValidateNoteContent(string noteId)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var note = await _context.Notes
                    .FirstOrDefaultAsync(n => n.Id == noteId && n.OwnerId == _userContext.UserId);

                if (note is null)
                {
                    rs.Message = "The selected note could not be found. Please check and try again.";
                    return rs;
                }
                var (markdown, _) = QuizGenerationPipeline.FlattenEditorJsNote(note.Content, true);
                rs.Result = markdown.Length <= MAX_LENGTH;
                if(!rs.Result)
                {
                    rs.Message = "The note content is reach 20.000 characters, Please choose another note!";
                }
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
