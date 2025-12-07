using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptAnswer;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class QuizAttemptAnswerBusiness : IQuizAttemptAnswerBusiness
    {
        ApplicationDbContext _context;
        IUserContext _userContext;
        IRepository<QuizAttemptAnswer, string> _repository;
        IMapper _mapper;

        public QuizAttemptAnswerBusiness(ApplicationDbContext context, IUserContext userContext, IRepository<QuizAttemptAnswer, string> repository, IMapper mapper)
        {
            this._context = context;
            this._userContext = userContext;
            this._repository = repository;
            this._mapper = mapper;
        }
        public async Task<ReturnResult<bool>> CreateQuizAttemptAnswer(string quizAttemptId, List<CreateQuizAttemptAnswerDTO> newEntity)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                // Fetch the existing quiz attempt to ensure it belongs to the user
                var existingAttempt = await _context.QuizAttempts.Where(x => x.Id == quizAttemptId
                                                                    && x.UserId == _userContext.UserId)
                                                                 .Include(x => x.QuizAttemptSnapshot)
                                                                 .ThenInclude(x => x.Quiz)
                                                                 .AsNoTracking()
                                                                 .FirstOrDefaultAsync();
                // Check if the attempt exists and belongs to the user
                if (existingAttempt != null && existingAttempt.QuizAttemptSnapshot.Quiz.OwnerId == _userContext.UserId)
                {
                    var questionsString = existingAttempt.QuizAttemptSnapshot.QuizQuestions;
                    if (!string.IsNullOrEmpty(questionsString))
                    {
                        // Deserialize the questions JSON string to a list of QuestionDTO
                        List<QuestionDTO> quizQuestions = JsonSerializer.Deserialize<List<QuestionDTO>>(questionsString)!;
                        List<QuizAttemptAnswer> answersToAdd = new List<QuizAttemptAnswer>();
                        foreach (var answer in newEntity)
                        {
                            // Find the question in the snapshot
                            var existingQuestionInSnapshot = quizQuestions.FirstOrDefault(q => q.Id == answer.SnapShotQuestionId);
                            if (existingQuestionInSnapshot != null)
                            {
                                List<string> allChoicesIdInQuestionInSnapshot = existingQuestionInSnapshot.Choices.Select(c => c.Id).ToList();
                                List<string> allSelectedChoicesIdInAnswer = answer.QuizAttemptAnswerChoices.Select(c => c.ChoiceId).ToList();
                                // Validate that all selected choices exist in the question
                                var invalidChoices = allSelectedChoicesIdInAnswer.Except(allChoicesIdInQuestionInSnapshot).ToList();
                                if (invalidChoices.Any())
                                {
                                    continue; // Skip this answer if it has invalid choices
                                }
                                List<string> correctAnswerIds = existingQuestionInSnapshot.Choices.Where(c => c.IsCorrect).Select(c => c.Id).ToList();
                                QuizAttemptAnswer attemptAnswer = new QuizAttemptAnswer
                                {
                                    QuizAttemptId = quizAttemptId,
                                    SnapshotQuestionId = answer.SnapShotQuestionId,
                                    IsCorrect = correctAnswerIds.Count == allSelectedChoicesIdInAnswer.Count && !correctAnswerIds.Except(allSelectedChoicesIdInAnswer).Any(),
                                };
                                answersToAdd.Add(attemptAnswer);
                            }
                        }
                        // Bulk Insert All Valid Answers
                        if (answersToAdd.Any())
                        {
                            await _context.QuizAttemptAnswers.AddRangeAsync(answersToAdd);
                            // Now Add The Choices For Each Answer
                            List<QuizAttemptAnswerChoice> choicesToAdd = new List<QuizAttemptAnswerChoice>();
                            foreach (var answer in answersToAdd)
                            {
                                var correspondingAnswerDto = newEntity.FirstOrDefault(a => a.SnapShotQuestionId == answer.SnapshotQuestionId);
                                if (correspondingAnswerDto != null)
                                {
                                    foreach (var choice in correspondingAnswerDto.QuizAttemptAnswerChoices)
                                    {
                                        QuizAttemptAnswerChoice answerChoice = new QuizAttemptAnswerChoice
                                        {
                                            QuizAttemptAnswerId = answer.Id,
                                            ChoiceId = choice.ChoiceId
                                        };
                                        choicesToAdd.Add(answerChoice);
                                    }
                                }
                            }
                            //Bulk Insert All Choices
                            if (choicesToAdd.Any())
                            {
                                await _context.QuizAttemptAnswerChoices.AddRangeAsync(choicesToAdd);
                            }
                            result.Result = await _context.SaveChangesAsync() > 0;
                        }
                    }
                    else
                    {
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "questions in quiz snapshot", quizAttemptId);
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz attempt", quizAttemptId);
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<QuizAttemptAnswerDTO>> CreateQuizAttemptAnswerForQuizSession(string quizAttemptId, CreateQuizAttemptAnswerDTO newEntity)
        {
            ReturnResult<QuizAttemptAnswerDTO> result = new ReturnResult<QuizAttemptAnswerDTO>();
            try
            {
                // Fetch the existing quiz attempt to ensure it belongs to the user
                var existingAttempt = await _context.QuizAttempts.Where(x => x.Id == quizAttemptId
                                                                    && x.UserId == _userContext.UserId)
                                                                 .Include(x => x.QuizAttemptSnapshot)
                                                                 .ThenInclude(x => x.Quiz)
                                                                 .Include(x => x.QuizSession)
                                                                 .AsNoTracking()
                                                                 .FirstOrDefaultAsync();
                
                // Check if the attempt exists and belongs to the user, and is part of an active quiz session
                if (existingAttempt == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz attempt", quizAttemptId);
                    return result;
                }

                // Verify this is a quiz session attempt
                if (existingAttempt.QuizSession == null)
                {
                    result.Message = "Quiz attempt is not associated with a quiz session";
                    return result;
                }

                // Check if user is the owner of the quiz session or a participant
                if (existingAttempt.QuizSession.OwnerId != _userContext.UserId && existingAttempt.UserId != _userContext.UserId)
                {
                    result.Message = "Unauthorized access to quiz session";
                    return result;
                }

                var questionsString = existingAttempt.QuizAttemptSnapshot.QuizQuestions;
                if (string.IsNullOrEmpty(questionsString))
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "questions in quiz snapshot", quizAttemptId);
                    return result;
                }

                // Deserialize the questions JSON string to a list of QuestionDTO
                List<QuestionDTO> quizQuestions = JsonSerializer.Deserialize<List<QuestionDTO>>(questionsString)!;
                
                // Find the question in the snapshot
                var existingQuestionInSnapshot = quizQuestions.FirstOrDefault(q => q.Id == newEntity.SnapShotQuestionId);
                if (existingQuestionInSnapshot == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "question", newEntity.SnapShotQuestionId);
                    return result;
                }

                List<string> allChoicesIdInQuestionInSnapshot = existingQuestionInSnapshot.Choices.Select(c => c.Id).ToList();
                List<string> allSelectedChoicesIdInAnswer = newEntity.QuizAttemptAnswerChoices.Select(c => c.ChoiceId).ToList();
                
                // Validate that all selected choices exist in the question
                var invalidChoices = allSelectedChoicesIdInAnswer.Except(allChoicesIdInQuestionInSnapshot).ToList();
                if (invalidChoices.Any())
                {
                    result.Message = "Invalid choices selected for the question";
                    return result;
                }

                // Check if answer already exists for this question in this attempt
                var existingAnswer = await _context.QuizAttemptAnswers
                    .Where(x => x.QuizAttemptId == quizAttemptId && x.SnapshotQuestionId == newEntity.SnapShotQuestionId)
                    .FirstOrDefaultAsync();

                if (existingAnswer != null)
                {
                    result.Message = "Answer already exists for this question";
                    return result;
                }

                List<string> correctAnswerIds = existingQuestionInSnapshot.Choices.Where(c => c.IsCorrect).Select(c => c.Id).ToList();
                
                // Create the quiz attempt answer
                QuizAttemptAnswer attemptAnswer = new QuizAttemptAnswer
                {
                    QuizAttemptId = quizAttemptId,
                    SnapshotQuestionId = newEntity.SnapShotQuestionId,
                    IsCorrect = correctAnswerIds.Count == allSelectedChoicesIdInAnswer.Count && !correctAnswerIds.Except(allSelectedChoicesIdInAnswer).Any(),
                };

                await _context.QuizAttemptAnswers.AddAsync(attemptAnswer);

                // Add the choices for the answer
                List<QuizAttemptAnswerChoice> choicesToAdd = new List<QuizAttemptAnswerChoice>();
                foreach (var choice in newEntity.QuizAttemptAnswerChoices)
                {
                    QuizAttemptAnswerChoice answerChoice = new QuizAttemptAnswerChoice
                    {
                        QuizAttemptAnswerId = attemptAnswer.Id,
                        ChoiceId = choice.ChoiceId
                    };
                    choicesToAdd.Add(answerChoice);
                }

                if (choicesToAdd.Any())
                {
                    await _context.QuizAttemptAnswerChoices.AddRangeAsync(choicesToAdd);
                }

                if (await _context.SaveChangesAsync() > 0)
                {
                    // Map the created entity to DTO
                    var createdAnswer = await _context.QuizAttemptAnswers
                        .Where(x => x.Id == attemptAnswer.Id)
                        .Include(x => x.QuizAttemptAnswerChoices)
                        .FirstOrDefaultAsync();

                    result.Result = _mapper.Map<QuizAttemptAnswerDTO>(createdAnswer);
                }
                else
                {
                    result.Message = "Failed to save quiz attempt answer";
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
    }
}
