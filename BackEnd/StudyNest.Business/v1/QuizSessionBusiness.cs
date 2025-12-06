using AutoMapper;
using CloudinaryDotNet.Actions;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
                    QuizAttemptSnapshotId = existingSnapshot!.Id
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
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == joinQuizSessionDTO.Id 
                                                                         && x.GamePin == joinQuizSessionDTO.GamePin)
                                                                        .AsNoTracking()
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
    }
}
