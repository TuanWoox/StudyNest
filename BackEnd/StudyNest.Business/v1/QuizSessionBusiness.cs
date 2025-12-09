using AutoMapper;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Mozilla;
using StudyNest.Business.Hubs.RealTimeCache;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
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
        ISettingBusiness _settingBusiness;
        IQuizAttemptBusiness _quizAttemptBusiness;
   
        public QuizSessionBusiness(ApplicationDbContext dbContext,
           IUserContext userContext,
           IMapper mapper,
           IQuizAttemptSnapshotBusiness quizAttemptSnapshotBusiness,
           IHubContext<Hubs.QuizSessionHub, Hubs.IQuizSessionClient> sessionHub,
           ISettingBusiness settingBusiness,
           IQuizAttemptBusiness quizAttemptBusiness)
        {
            this._dbContext = dbContext;
            this._quizAttemptSnapshotBusiness = quizAttemptSnapshotBusiness;
            this._userContext = userContext;
            this._mapper = mapper;
            this._sessionHub = sessionHub;
            this._settingBusiness = settingBusiness;
            this._quizAttemptBusiness = quizAttemptBusiness;
        }
        public async Task<ReturnResult<QuizSessionDTO>> GetQuizSessionById(string id)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == id.Trim())
                                                                        .FirstOrDefaultAsync();
                if (existingQuizSession != null)
                {
                    result.Result = _mapper.Map<QuizSessionDTO>(existingQuizSession);
                }
                else
                {
                    result.Message = String.Format(ResponseMessage.MESSAGE_ALL_ITEM_NOT_FOUND, "quiz session", id);
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
        public async Task<ReturnResult<QuizSessionDTO>> GetActiveQuizSessionByQuizId(string quizId)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                var existingQuizSessionActive = await _dbContext.QuizSessions.Where(x => x.QuizAttemptSnapshot.QuizId == quizId.Trim()
                                                                                && x.Status == QuizSessionStatus.NotStarted)
                                                                              .FirstOrDefaultAsync();
                if (existingQuizSessionActive != null)
                {
                    result.Result = _mapper.Map<QuizSessionDTO>(existingQuizSessionActive);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
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
                                                                             && x.Status != QuizSessionStatus.Abandoned
                                                                             && x.Status != QuizSessionStatus.Completed)
                                                                    .AsNoTracking()
                                                                    .FirstOrDefaultAsync();

                if (existingQuizSession != null)
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
        public async Task<ReturnResult<List<string>>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO, string connectionId)
        {
            var result = new ReturnResult<List<string>>();

            try
            {
                // Validate user state before joining
                var existingPlayer = QuizSessionCache.GetPlayerByUserId(joinQuizSessionDTO.Id, _userContext.UserId);

                if (existingPlayer != null)
                {
                    // Update connection ID if user reconnected
                    QuizSessionCache.UpdatePlayerConnection(joinQuizSessionDTO.Id, _userContext.UserId, connectionId);

                    result.Message = "Already joined the quiz session. Connection updated.";
                    result.Result = QuizSessionCache
                        .GetPlayers(joinQuizSessionDTO.Id)
                        .Select(p => p.Name)
                        .ToList();

                    return result;
                }

                // Check if user is already in another session
                var otherSessionId = QuizSessionCache.FindSessionByUserId(_userContext.UserId, joinQuizSessionDTO.Id);

                if (otherSessionId != null)
                {
                    result.Message = "User already in another quiz session. Please leave that session first.";
                    return result;
                }

                // Get max connection setting with default value
                var settingResult = await _settingBusiness.GetOneByKeyAndGroup("MAX_CONNECTION", "QUIZ_SESSSION");
                var maxConnectionSetting = 10; // default value

                if (settingResult?.Result?.Value != null &&
                    int.TryParse(settingResult.Result.Value, out var parsedValue))
                {
                    maxConnectionSetting = parsedValue;
                }

                // Check if session has reached maximum capacity
                int currentPlayersInSession = QuizSessionCache.GetPlayerCount(joinQuizSessionDTO.Id);

                if (currentPlayersInSession >= maxConnectionSetting)
                {
                    result.Message = $"Quiz session has reached its maximum capacity of {maxConnectionSetting} players.";
                    return result;
                }

                // Validate quiz session exists and is available to join
                // If it is the owner, no need to check game pin otherwise need to match
                var existingQuizSession = await _dbContext.QuizSessions
                    .Where(x => x.Id == joinQuizSessionDTO.Id &&
                               (x.GamePin == joinQuizSessionDTO.GamePin || x.OwnerId == _userContext.UserId))
                    .FirstOrDefaultAsync();

                if (existingQuizSession == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", joinQuizSessionDTO.Id);
                    return result;
                }

                if (existingQuizSession.Status != Common.Utils.Enums.QuizSessionStatus.NotStarted)
                {
                    result.Message = "This quiz session is no longer available to join";
                    return result;
                }

                // All validations passed - add player to session
                // Initialize session in cache if not exists
                QuizSessionCache.InitializeSession(joinQuizSessionDTO.Id);

                // Add player information to the cache
                var newPlayer = new PlayerInformation
                {
                    Name = _userContext.UserName,
                    UserId = _userContext.UserId,
                    ConnectionId = connectionId
                };

                QuizSessionCache.AddPlayer(joinQuizSessionDTO.Id, newPlayer);

                result.Result = QuizSessionCache
                    .GetPlayers(joinQuizSessionDTO.Id)
                    .Select(x => x.Name)
                    .ToList();
            }
            catch (Exception ex)
            {
                result.Message = "An error occurred while joining the quiz session.";
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task<ReturnResult<bool>> StartQuizSession(string quizSessionId)
        {
            var result = new ReturnResult<bool>();

            try
            {
                // Validate that the quiz session exists, has players, and belongs to owner
                var existingQuizSession = await _dbContext.QuizSessions
                    .Where(x => x.Id == quizSessionId.Trim() &&
                                x.Status == QuizSessionStatus.NotStarted &&
                                x.OwnerId == _userContext.UserId)
                    .FirstOrDefaultAsync();

                if (existingQuizSession == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", quizSessionId);
                    return result;
                }

                // Validate players exist
                var players = QuizSessionCache.GetPlayers(quizSessionId);

                if (players.Count == 0)
                {
                    result.Message = "Cannot start quiz with no players.";
                    return result;
                }

                // Notify loading state
                await _sessionHub.Clients.Group(quizSessionId).QuizToggleLoadingPrepare(new
                {
                    loading = true
                });

                await Task.Delay(2000);

                // Mark session as InProgress
                existingQuizSession.Status = QuizSessionStatus.InProgress;

                if (await _dbContext.SaveChangesAsync() <= 0)
                {
                    result.Message = "Fail to save, please try to start again";
                    return result;
                }

                // Get quiz id and quiz session info
                var quizIdResult = await GetQuizIdByQuizSessionId(quizSessionId);
                var quizSessionResult = await GetQuizSessionById(quizSessionId);

                if (string.IsNullOrEmpty(quizIdResult.Result))
                {
                    result.Message = "Failed to retrieve quiz ID.";
                    return result;
                }

                // Get quiz snapshot
                var quizAttemptSnapshotResult = await _quizAttemptSnapshotBusiness
                    .GetOneByIdForAttempting(quizIdResult.Result, true);

                if (quizAttemptSnapshotResult.Result == null)
                {
                    result.Message = quizAttemptSnapshotResult.Message ?? "Failed to retrieve quiz snapshot.";
                    return result;
                }

                // Create quiz attempts for all players
                var quizAttemptCreatedResult = await _quizAttemptBusiness.CreateQuizAttemptForQuizSession(
                    players.Select(x => x.UserId).ToList(),
                    quizAttemptSnapshotResult.Result.Id,
                    quizSessionId
                );

                // Send individual quiz attempt to each player
                foreach (var player in players)
                {
                    await _sessionHub.Clients.User(player.UserId).SendQuizAttempt(new
                    {
                        quizAttempt = quizAttemptCreatedResult.Result.FirstOrDefault(x => x.UserId == player.UserId)
                    });
                }

                // Notify all players that quiz has started
                await _sessionHub.Clients.Group(quizSessionId).QuizHasBeenStarted(new
                {
                    quizAttemptSnapshot = quizAttemptSnapshotResult.Result
                });

                // Schedule auto-submit
                BackgroundJob.Schedule<IQuizSessionBusiness>(
                    x => x.TriggerSubmitAnswer(quizSessionId, quizAttemptSnapshotResult.Result),
                    TimeSpan.FromSeconds(quizSessionResult.Result.TimeForEachQuestion)
                );

                result.Result = true;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }

            // Turn loading OFF for all users
            await _sessionHub.Clients.Group(quizSessionId).QuizToggleLoadingPrepare(new
            {
                loading = false
            });

            return result;
        }
        public async Task<ReturnResult<bool>> TriggerSubmitAnswer(string quizSessionId, QuizAttemptSnapshotDTO snapshot)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == quizSessionId.Trim()
                                                                        && x.Status == QuizSessionStatus.InProgress)
                                                                        .FirstOrDefaultAsync();
                if (existingQuizSession != null)
                {
                    //Notify all user to submit the answer
                    await _sessionHub.Clients.Groups(quizSessionId).SubmitAnswer();
                    //We delay so that user can see the answer result before moving to next question
                    await Task.Delay(2000);
                    if (existingQuizSession.CurrentQuestionIndex + 1 < snapshot.QuizQuestionsParsed?.Count())
                    {
                        existingQuizSession.CurrentQuestionIndex = existingQuizSession.CurrentQuestionIndex + 1;
                        _dbContext.Update(existingQuizSession);

                        if (await _dbContext.SaveChangesAsync() > 0)
                        {
                            await _sessionHub.Clients.Groups(quizSessionId).MoveToNextQuestion();
                            BackgroundJob.Schedule<IQuizSessionBusiness>(x => x.TriggerSubmitAnswer(quizSessionId, snapshot), TimeSpan.FromSeconds(existingQuizSession.TimeForEachQuestion));
                            result.Result = true;
                        }
                        else
                        {
                            result.Message = "Cannot save quiz session, please try again";
                            StudyNestLogger.Instance.Error($"Failed to save quiz session {quizSessionId} when moving to next index");
                        }
                    }
                    else
                    {
                        existingQuizSession.Status = QuizSessionStatus.Completed;
                        _dbContext.Update(existingQuizSession);
                        if(await _dbContext.SaveChangesAsync() > 0)
                        {
                            var existingAttempts = await _dbContext.QuizAttempts.Where(x => x.QuizSessionId == quizSessionId)
                                                                                        .Include(x => x.User)
                                                                                        .OrderByDescending(x => x.Score)
                                                                                        .AsNoTracking()                                                                                        
                                                                                        .ToListAsync();

                            List<QuizAttemptDTO> quizAttemptDTOs = new List<QuizAttemptDTO>();
                            if(existingAttempts.Count() > 0)
                            {
                                quizAttemptDTOs = _mapper.Map<List<QuizAttemptDTO>>(existingAttempts);
                            }
                            await _sessionHub.Clients.Group(quizSessionId).QuizEnded(quizAttemptDTOs);
                        }
                        else
                        {
                            result.Message = "Cannot save quiz session, please try again";
                            StudyNestLogger.Instance.Error($"Failed to save quiz session {quizSessionId} when ending the quiz");
                        }
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz session", quizSessionId);
                }
            }
            catch (Exception ex)
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
        public async Task<ReturnResult<bool>> TerminateQuizSession(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                var existingQuizSession = await _dbContext.QuizSessions.Where(x => x.Id == id.Trim() 
                                                                        && x.Status == QuizSessionStatus.NotStarted
                                                                        && x.OwnerId == _userContext.UserId)
                                                                        .FirstOrDefaultAsync();
                if(existingQuizSession != null)
                {
                    existingQuizSession.Status = QuizSessionStatus.Abandoned;
                    _dbContext.Update(existingQuizSession);
                    if(await _dbContext.SaveChangesAsync() > 0)
                    {
                        result.Result = true;
                        await _sessionHub.Clients.Group(id).QuizTerminated();
                    }
                    else
                    {
                        result.Message = "Cannot terminate the quiz session, please try again";
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_EXIST, "quiz sesison", id);
                }
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return result;
        }
    }
}
