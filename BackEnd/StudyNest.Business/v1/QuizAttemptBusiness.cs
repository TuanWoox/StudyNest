using AutoMapper;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptAnswer;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System.Text.Json;

namespace StudyNest.Business.v1
{
    public class QuizAttemptBusiness: IQuizAttemptBusiness
    {
        ApplicationDbContext _dbContext;
        IRepository<QuizAttempt, string> _repository;
        IUserContext _userContext;
        IQuizAttemptAnswerBusiness _quizAttemptAnswerBusiness;
        IMapper _mapper;
        public QuizAttemptBusiness(ApplicationDbContext dbContext, IRepository<QuizAttempt, string> repository, IUserContext userContext,
        IMapper mapper, IQuizAttemptAnswerBusiness quizAttemptAnswerBusiness)
        {
            this._dbContext = dbContext;
            this._repository = repository;
            this._userContext = userContext;
            this._quizAttemptAnswerBusiness = quizAttemptAnswerBusiness;
            this._mapper = mapper;  
        }
        public async Task<ReturnResult<PagedData<SelectQuizAttemptDTO, string>>> GetPaging(Page<string> page, bool isExported = false)
        {
            ReturnResult<PagedData<SelectQuizAttemptDTO, string>> result = new ReturnResult<PagedData<SelectQuizAttemptDTO, string>>();
            try
            {
                var query = _dbContext.QuizAttempts.Where(x => x.UserId == _userContext.UserId)
                                                .OrderByDescending(x => x.DateCreated)
                                                .AsNoTracking()
                                                .AsQueryable();
                var pagedData = await _repository.GetPagingAsync<Page<string>, SelectQuizAttemptDTO>(query, page, isExported);
                result.Result = pagedData;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<PagedData<SelectQuizAttemptDTO, string>>> GetPagingByQuizId(Page<string> page, string quizId, bool isExported = false)
        {
            ReturnResult<PagedData<SelectQuizAttemptDTO, string>> result = new ReturnResult<PagedData<SelectQuizAttemptDTO, string>>();
            try
            {
                var query = _dbContext.QuizAttempts.Where(x => x.UserId == _userContext.UserId && x.QuizAttemptSnapshot.QuizId == quizId)
                                                .Include(x => x.QuizAttemptSnapshot)
                                                .OrderByDescending(x => x.DateCreated)
                                                .AsNoTracking()
                                                .AsQueryable();
                var pagedData = await _repository.GetPagingAsync<Page<string>, SelectQuizAttemptDTO>(query, page, isExported);
                result.Result = pagedData;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<QuizAttemptDTO>> GetOneById(string id)
        {
            ReturnResult<QuizAttemptDTO> result = new ReturnResult<QuizAttemptDTO>();
            try
            {
                var existingQuizAttempt = await _dbContext.QuizAttempts.Where(x => x.Id == id.Trim()
                                                                        && x.UserId == _userContext.UserId)
                                                                       .Include(x => x.QuizAttemptSnapshot)
                                                                       .Include(x => x.QuizAttemptAnswers)
                                                                       .ThenInclude(x => x.QuizAttemptAnswerChoices)
                                                                       .FirstOrDefaultAsync();
                if(existingQuizAttempt != null)
                {
                    List<QuestionDTO> parsedQuestions = JsonSerializer.Deserialize<List<QuestionDTO>>(existingQuizAttempt.QuizAttemptSnapshot.QuizQuestions)!;
                    result.Result = _mapper.Map<QuizAttemptDTO>(existingQuizAttempt);
                    result.Result.QuizAttemptSnapshot.QuizQuestions = "";
                    result.Result.QuizAttemptSnapshot.QuizQuestionsParsed = parsedQuestions;
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz attempt", id);
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<string>> SubmitQuizAttempt(string quizAttemptSnapshotId, List<CreateQuizAttemptAnswerDTO> submittedAnswers)
        {
            ReturnResult<string> result = new ReturnResult<string>();
            try
            {
               var createdResult = await CreateQuizAttempt(new CreateQuizAttemptDTO { QuizAttemptSnapshotId = quizAttemptSnapshotId });
                // Check if quiz attempt creation was successful
                if (createdResult.Result == null)
                {
                    // If creation failed, return the error message
                    result.Message = createdResult.Message ?? "Failed to create quiz attempt.";
                    return result;
                }
                // Only create AttemptAnswer when there are submittedAnswers
                if (submittedAnswers?.Count() > 0)
                {
                    // Save all answers at once, not one by one
                    await _quizAttemptAnswerBusiness.CreateQuizAttemptAnswer(createdResult.Result.Id, submittedAnswers);
                }
              
                // NOW query the existing attempt with all answers included
                var existingAttempt = await _dbContext.QuizAttempts.Where(x => x.Id == createdResult.Result.Id && x.UserId == _userContext.UserId)
                                                                .Include(x => x.QuizAttemptSnapshot)
                                                                .Include(x => x.QuizAttemptAnswers)
                                                                .FirstOrDefaultAsync();
                if (existingAttempt != null)
                {

                    var jsonString = existingAttempt.QuizAttemptSnapshot.QuizQuestions;
                    if (!string.IsNullOrEmpty(jsonString))
                    {
                        //We are sure to put ! because we have check above
                        List<QuestionDTO> parsedQuestions = JsonSerializer.Deserialize<List<QuestionDTO>>(jsonString)!;

                        // Check if questions were parsed successfully
                        if (parsedQuestions == null || !parsedQuestions.Any())
                        {
                            result.Message = "No questions found in quiz snapshot.";
                            return result;
                        }
                        // Calculate the score (Percentage of correct answers)
                        int totalQuestions = parsedQuestions.Count;
                        int correctAnswers = existingAttempt.QuizAttemptAnswers.Where(x => x.IsCorrect).Count();
                        existingAttempt.Score = (int)Math.Round((double)(correctAnswers * 100) / totalQuestions);
                        // Track the entity for changes before saving
                        _dbContext.QuizAttempts.Update(existingAttempt);
                        // Update the attempt as completed
                        if (await _dbContext.SaveChangesAsync() > 0)
                        {
                            result.Result = existingAttempt.Id;
                        }
                        else
                        {
                            result.Message = "Failed to update quiz attempt with score.";
                        }
                    }
                    else
                    {
                        result.Message = "Quiz attempt snapshot is empty.";
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz attempt", createdResult.Result.Id);
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<QuizAttemptDTO>> CreateQuizAttempt(CreateQuizAttemptDTO newEntity)
        {
            ReturnResult<QuizAttemptDTO> result = new ReturnResult<QuizAttemptDTO>();
            try
            {
                // Find the latest snapshot for this quiz
                var latestSnapshot = await _dbContext.QuizAttemptSnapshots
                                                    .Where(x => x.Id == newEntity.QuizAttemptSnapshotId)     
                                                    .Include(x => x.Quiz)
                                                    .AsNoTracking()
                                                    .FirstOrDefaultAsync();

                // Create quiz attempt with the snapshot
                if (latestSnapshot != null)
                {
                    if (latestSnapshot.Quiz == null)
                    {
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz",latestSnapshot.QuizId);
                        return result;
                    }


                    if (latestSnapshot.Quiz.OwnerId != _userContext.UserId)
                    {
                        result.Message = ResponseMessage.MESSAGE_FORBIDDEN;
                        return result;
                    }

                    var savedResult = await _repository.CreateAsync(new QuizAttempt{
                        UserId = _userContext.UserId,
                        QuizAttemptSnapshotId = latestSnapshot.Id.ToString(),
                    });

                    if (savedResult.Message == null)
                    {
                        result.Result = _mapper.Map<QuizAttemptDTO>(savedResult.Result);
                    }
                } 
                else
                {
                    result.Message = string.Format(
                        ResponseMessage.MESSAGE_ITEM_NOT_FOUND,
                        "quiz attempt snapshot",
                        newEntity.QuizAttemptSnapshotId
                    );
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
