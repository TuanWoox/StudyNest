using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StudyNest.Business.v1;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Business.Hubs
{
    public interface IQuizSessionClient
    {
        Task UserJoinQuizSession(object dataSendBack);
        Task UserExitQuizSession(object dataSendBack);
        Task QuizHasBeenStarted(object dataSendBack);
        Task QuizToggleLoadingPrepare(object dataSendBack);
        Task SendQuizAttempt(object dataSendback);
        Task SubmitAnswer();
        Task MoveToNextQuestion();
    }

    public class PlayerInformation
    {
        public string Name { get; set; }
        public string UserId { get; set; }
        public string ConnectionId { get; set; }
    }

    [Authorize]
    public class QuizSessionHub : Hub<IQuizSessionClient>
    {
        private readonly IQuizSessionBusiness _quizSessionBusiness;
        private readonly IUserContext _userContext;
        private readonly ISettingBusiness _settingBusinees;
        private readonly IQuizAttemptSnapshotBusiness _quizAttemptSnapshotBusiness;
        private readonly IQuizAttemptBusiness _quizAttemptBusiness;

        // Track what quiz each connection has joined, QuizSessionId -> List Of Player Information
        private static readonly Dictionary<string, List<PlayerInformation>> _connectionToQuizMap = new();

        public QuizSessionHub(IQuizSessionBusiness quizBusiness,
            IUserContext userContext, 
            ISettingBusiness settingBusinees,
            IQuizAttemptSnapshotBusiness quizAttemptSnapshotBusiness,
            IQuizAttemptBusiness quizAttemptBusiness
        )
        {
            _quizSessionBusiness = quizBusiness;
            _userContext = userContext;
            _settingBusinees = settingBusinees;
            _quizAttemptSnapshotBusiness = quizAttemptSnapshotBusiness;
            _quizAttemptBusiness = quizAttemptBusiness;
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Find which quiz session this connection belongs to
            var sessionEntry = _connectionToQuizMap.FirstOrDefault(kvp =>
                kvp.Value.Any(p => p.ConnectionId == Context.ConnectionId));

            if (sessionEntry.Key != null)
            {
                var sessionId = sessionEntry.Key;
                var players = sessionEntry.Value;

                // Remove the player from the list
                var playerToRemove = players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                if (playerToRemove != null)
                {
                    players.Remove(playerToRemove);

                    // If no players left, remove the session entry entirely
                    if (players.Count == 0)
                    {
                        _connectionToQuizMap.Remove(sessionId);
                    }

                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);

                    var dataSendBack = new
                    {
                        players = players.Select(p => p.Name).ToList(),
                    };

                    await Clients.Group(sessionId).UserExitQuizSession(dataSendBack);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task LeaveQuizSession(string quizSessionId)
        {
            if (_connectionToQuizMap.TryGetValue(quizSessionId, out List<PlayerInformation>? players))
            {
                var playerToRemove = players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                if (playerToRemove != null)
                {
                    players.Remove(playerToRemove);

                    // If no players left, remove the session entry entirely
                    if (players.Count == 0)
                    {
                        _connectionToQuizMap.Remove(quizSessionId);
                    }

                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, quizSessionId);

                    var dataSendBack = new
                    {
                        players = players.Select(p => p.Name),
                    };

                    await Clients.OthersInGroup(quizSessionId).UserExitQuizSession(dataSendBack);
                }
            }
        }

        public async Task<ReturnResult<List<string>>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO)
        {
            var result = new ReturnResult<List<string>>();

            try
            {
                // Validate user state before joining
                if (_connectionToQuizMap.TryGetValue(joinQuizSessionDTO.Id, out List<PlayerInformation>? players))
                {
                    // Check if user already joined this session
                    var existingPlayer = players.FirstOrDefault(p => p.UserId == _userContext.UserId);
                    if (existingPlayer != null)
                    {
                        // Update connection ID if user reconnected
                        existingPlayer.ConnectionId = Context.ConnectionId;
                        result.Message = "Already joined the quiz session. Connection updated.";
                        result.Result = players.Select(p => p.Name).ToList();
                        return result;
                    }
                }
                else
                {
                    // Initialize the list if this is the first player
                    _connectionToQuizMap[joinQuizSessionDTO.Id] = new List<PlayerInformation>();
                    players = _connectionToQuizMap[joinQuizSessionDTO.Id];
                }

                // Check if user is already in another session
                var otherSession = _connectionToQuizMap.FirstOrDefault(kvp =>
                    kvp.Key != joinQuizSessionDTO.Id &&
                    kvp.Value.Any(p => p.UserId == _userContext.UserId));

                if (otherSession.Key != null)
                {
                    result.Message = "User already in another quiz session. Please leave that session first.";
                    return result;
                }

                // Get max connection setting with default value
                var settingResult = await _settingBusinees.GetOneByKeyAndGroup("MAX_CONNECTION", "QUIZ_SESSSION");
                var maxConnectionSetting = 10; // default value

                if (settingResult?.Result?.Value != null && int.TryParse(settingResult.Result.Value, out var parsedValue))
                {
                    maxConnectionSetting = parsedValue;
                }

                // Check if session has reached maximum capacity
                int currentPlayersInSession = players.Count;

                if (currentPlayersInSession >= maxConnectionSetting)
                {
                    result.Message = $"Quiz session has reached its maximum capacity of {maxConnectionSetting} players.";
                    return result;
                }

                // Attempt to join the quiz session
                var joinedResult = await _quizSessionBusiness.JoinQuizSession(joinQuizSessionDTO);

                if (joinedResult.Result)
                {
                    // Add user to SignalR group
                    await Groups.AddToGroupAsync(Context.ConnectionId, joinQuizSessionDTO.Id);

                    // Add player information to the tracking dictionary
                    var newPlayer = new PlayerInformation
                    {
                        Name = _userContext.UserName,
                        UserId = _userContext.UserId,
                        ConnectionId = Context.ConnectionId
                    };
                    players.Add(newPlayer);

                    // Notify other users in the session
                    var dataSendBack = new
                    {
                        players = players.Select(x => x.Name).ToList(),
                    };

                    await Clients.OthersInGroup(joinQuizSessionDTO.Id).UserJoinQuizSession(dataSendBack);

                    result.Result = [.. players.Select(x => x.Name)];
                }
            }
            catch (Exception ex)
            {
                result.Message = "An error occurred while joining the quiz session.";
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task<ReturnResult<bool>> StartQuiz(string quizSessionId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                // Validate that the quiz session exists and has players
                if (!_connectionToQuizMap.TryGetValue(quizSessionId, out List<PlayerInformation>? players))
                {
                    result.Message = "Quiz session not found or no players have joined.";
                    return result;
                }

                if (players.Count == 0)
                {
                    result.Message = "Cannot start quiz with no players.";
                    return result;
                }

                // Show loading state to all players
                await Clients.Group(quizSessionId).QuizToggleLoadingPrepare(new
                {
                    loading = true
                });

                await Task.Delay(2000);

                // Call the business logic to start the quiz
                var startResult = await _quizSessionBusiness.StartQuiz(quizSessionId);
                var quizIdResult = await _quizSessionBusiness.GetQuizIdByQuizSessionId(quizSessionId);
                var quizSessionResult = await _quizSessionBusiness.GetQuizSessionById(quizSessionId);

                if (startResult.Result && !string.IsNullOrEmpty(quizIdResult.Result))
                {
                    // Get the quiz attempt snapshot for this quiz, and we will returning even the is correct
                    var quizAttemptSnapshotResult = await _quizAttemptSnapshotBusiness.GetOneByIdForAttempting(quizIdResult.Result, true);
                    
                    if (quizAttemptSnapshotResult.Result != null)
                    {
                        // Create quiz attempts for all players in the session
                        var quizAttemptCreatedResult = await _quizAttemptBusiness.CreateQuizAttemptForQuizSession(
                            players.Select(x => x.UserId).ToList(), 
                            quizAttemptSnapshotResult.Result.Id,
                            quizSessionId
                        );

                        // Send individual quiz attempt to each player
                        foreach (var player in players)
                        {
                            await Clients.User(player.UserId).SendQuizAttempt(new
                            {
                                quizAttempt = quizAttemptCreatedResult.Result.FirstOrDefault(x => x.UserId == player.UserId)
                            });
                        }

                        // Notify all players in the session that the quiz has started
                        await Clients.Group(quizSessionId).QuizHasBeenStarted(new
                        {
                            quizAttemptSnapshot = quizAttemptSnapshotResult.Result
                        });
                        BackgroundJob.Schedule<IQuizSessionBusiness>(x => x.TriggerSubmitAnswer(quizSessionId, quizAttemptSnapshotResult.Result), TimeSpan.FromSeconds(quizSessionResult.Result.TimeForEachQuestion));
                    }
                    else
                    {
                        result.Message = quizAttemptSnapshotResult.Message ?? "Failed to retrieve quiz snapshot.";
                    }
                }
                else
                {
                    result.Message = startResult.Message ?? "Failed to start quiz.";
                }

            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                StudyNestLogger.Instance.Error(ex.Message);
            }
            await Clients.Group(quizSessionId).QuizToggleLoadingPrepare(new
            {
                loading = false
            });

            return result;
        }
        
    }
}
