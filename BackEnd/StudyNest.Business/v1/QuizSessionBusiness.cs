using AutoMapper;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;

namespace StudyNest.Business.v1
{
    public class QuizSessionBusiness: IQuizSessionBusiness
    {
        ApplicationDbContext _dbContext;
        IUserContext _userContext;
        IMapper _mapper;
        IQuizAttemptSnapshotBusiness _quizAttemptSnapshotBusiness;
        IHubContext<Hubs.QuizSessionHub, Hubs.IQuizSessionClient> _sessionHub;
        public QuizSessionBusiness(
            ApplicationDbContext dbContext,
            IUserContext userContext, 
            IMapper mapper,
            IQuizAttemptSnapshotBusiness quizAttemptSnapshotBusiness,
            IHubContext<Hubs.QuizSessionHub, Hubs.IQuizSessionClient> sessionHub)
        {
            this._dbContext = dbContext;
            this._quizAttemptSnapshotBusiness = quizAttemptSnapshotBusiness;
            this._userContext = userContext;
            this._mapper = mapper;
            this._sessionHub = sessionHub;
        }

        public async Task<ReturnResult<QuizSessionDTO>> CreateQuizSession(CreateQuizSessionDTO newEntity)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                var existingQuiz = await _dbContext.Quizzes.Where(x => x.Id == newEntity.QuizId && x.OwnerId == _userContext.UserId)
                                                            .AsNoTracking()
                                                            .FirstOrDefaultAsync();
                if (existingQuiz == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", newEntity.QuizId);
                    return result;
                }

                var existingSnapshot = await _dbContext.QuizAttemptSnapshots.Where(x => x.QuizId == newEntity.QuizId)
                                                                            .OrderByDescending(X => X.DateCreated)
                                                                            .AsNoTracking()
                                                                            .FirstOrDefaultAsync();
                //Because the flow right now is from the fronend calling the create snapshot => after that then allow us to create a quiz session so that we dont have too
                // many logic that is nested with each other, just reuse again
                if (existingSnapshot == null || (await _quizAttemptSnapshotBusiness.CompareQuizSnapShotContentForCreatingNewOne(existingSnapshot, newEntity.QuizId)).Result)
                {
                    result.Message = "Invalid creation quiz session";
                    return result;
                }

                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.QuizAttemptSnapshot.QuizId == newEntity.QuizId
                                                                        && x.Status != Common.Utils.Enums.QuizSessionStatus.Abandoned)
                                                                        .AsNoTracking()
                                                                        .FirstOrDefaultAsync();
                if(existingQuizSession != null)
                {
                    result.Message = "There is a session still going on, please abandon it or wait for it to be abandon and then start again";
                    return result;
                }

                QuizSession newQuizSession = new QuizSession
                {
                    GamePin = newEntity.GamePin,
                    TimeForEachQuestion = newEntity.TimeForEachQuestion,
                    QuizAttemptSnapshotId = existingSnapshot!.Id,
                    OwnerId = _userContext.UserId,
                };
                _dbContext.Add(newQuizSession);
                if (await _dbContext.SaveChangesAsync() > 0)
                {
                    result.Result = _mapper.Map<QuizSessionDTO>(newQuizSession);
                    BackgroundJob.Schedule<IQuizSessionBusiness>(x => x.TerminateQuizSessionAfterLongTimeNotStarted(newQuizSession.Id), TimeSpan.FromMinutes(30));
                }
                else
                {
                    result.Message = "Cannot create a quiz session, please try again";
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> TerminateQuizSessionAfterLongTimeNotStarted(string quizSessionId)
        {
            var result = new ReturnResult<bool>();
            var trimmedId = quizSessionId?.Trim();

            try
            {
                var existingQuizSession = await _dbContext.QuizSessions
                    .Where(x => x.Id == trimmedId)
                    .FirstOrDefaultAsync();

                if (existingQuizSession != null)
                {
                    existingQuizSession.Status = Common.Utils.Enums.QuizSessionStatus.Abandoned;
                    _dbContext.Update(existingQuizSession);

                    if (await _dbContext.SaveChangesAsync() > 0)
                    {
                        result.Result = true;
                        StudyNestLogger.Instance.Info(
                            $"Abandoned quizSessionId '{trimmedId}' because it exceeded the time limit."
                        );
                    }
                    else
                    {
                        result.Message = "Cannot save the quiz session. Please try again.";
                        StudyNestLogger.Instance.Info(
                            $"Database save failed for quizSessionId '{trimmedId}'."
                        );

                        BackgroundJob.Enqueue<IQuizSessionBusiness>(x =>
                            x.TerminateQuizSessionAfterLongTimeNotStarted(trimmedId));
                    }
                }
                else
                {
                    StudyNestLogger.Instance.Info(
                        $"Cannot find quiz session with the provided quizSessionId '{trimmedId}'."
                    );
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(
                    $"Exception while terminating quizSessionId '{trimmedId}': {ex}"
                );
            }
            return result;
        }
        public async Task<ReturnResult<bool>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                // If it is the owner, no need to check game pin otherwise need to match
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == joinQuizSessionDTO.Id &&
                                                                        (x.GamePin == joinQuizSessionDTO.GamePin || x.OwnerId == _userContext.UserId))
                                                                        .FirstOrDefaultAsync();

                if (existingQuizSession == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", joinQuizSessionDTO.Id);
                    return result;
                }
                if(existingQuizSession.Status != Common.Utils.Enums.QuizSessionStatus.NotStarted)
                {
                    result.Message = "This quiz session is no longer available to join";
                    return result;
                }
                result.Result = true;
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<QuizSessionDTO>> GetQuizSessionById(string id)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == id.Trim())
                                                                        .FirstOrDefaultAsync();
                if(existingQuizSession != null)
                {
                    result.Result = _mapper.Map<QuizSessionDTO>(existingQuizSession);
                }
                else
                {
                    result.Message = String.Format(ResponseMessage.MESSAGE_ALL_ITEM_NOT_FOUND, "quiz session", id);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> StartQuiz(string quizSessionId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == quizSessionId.Trim() &&
                                                         x.Status == QuizSessionStatus.NotStarted 
                                                         && x.OwnerId == _userContext.UserId
                                                        ).FirstOrDefaultAsync();
                if(existingQuizSession != null)
                {
                    existingQuizSession.Status = QuizSessionStatus.InProgress;
                    if(await _dbContext.SaveChangesAsync() > 0)
                    {
                        result.Result = true;
                    }
                    else
                    {
                        result.Message = string.Format("Fail to save, please try to start again");
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", quizSessionId);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<string>> GetQuizIdByQuizSessionId(string quizSessionId)
        {
            ReturnResult<string> result = new ReturnResult<string>();
            try
            {
                var existingSession = await _dbContext.QuizSessions.Where(x => x.Id == quizSessionId).Include(x => x.QuizAttemptSnapshot).FirstOrDefaultAsync();
                if(existingSession != null)
                {
                    result.Result = existingSession.QuizAttemptSnapshot.QuizId ?? "";
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", quizSessionId);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> MoveToNextIndex(string quizSessionId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == quizSessionId.Trim() 
                                                                        && x.Status == QuizSessionStatus.InProgress).
                                                                        FirstOrDefaultAsync();
                if(existingQuizSession != null)
                {
                    existingQuizSession.CurrentQuestionIndex = existingQuizSession.CurrentQuestionIndex + 1;
                    _dbContext.Update(existingQuizSession);
                    if(await _dbContext.SaveChangesAsync() > 0)
                    {
                        result.Result = true;
                    }
                    else
                    {
                        result.Message = "Cannot save try again";
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", quizSessionId);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> TriggerSubmitAnswer(string quizSessionId, QuizAttemptSnapshotDTO snapshot)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var quizSessionResult = await GetQuizSessionById(quizSessionId);
                if (quizSessionResult.Result != null)
                {
                    //Notify all user to submit the answer
                    await _sessionHub.Clients.Groups(quizSessionId).SubmitAnswer();
                    //We delay so that user can see the answer result before moving to next question
                    await Task.Delay(5000);
                    if (quizSessionResult.Result.CurrentQuestionIndex + 1 < snapshot.QuizQuestionsParsed?.Count())
                    {
                        var updatedIndexResult = await MoveToNextIndex(quizSessionId);
                        if (updatedIndexResult.Result)
                        {
                            await _sessionHub.Clients.Groups(quizSessionId).MoveToNextQuestion();
                            BackgroundJob.Schedule<IQuizSessionBusiness>(x => x.TriggerSubmitAnswer(quizSessionId, snapshot), TimeSpan.FromSeconds(quizSessionResult.Result.TimeForEachQuestion));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
    }
}
