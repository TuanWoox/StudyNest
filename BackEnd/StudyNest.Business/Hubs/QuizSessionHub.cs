using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StudyNest.Business.Hubs.RealTimeCache;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;


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
        Task QuizEnded(List<QuizAttemptDTO> quizSessionAttempts);
        Task QuizTerminated();
    }
    [Authorize]
    public class QuizSessionHub : Hub<IQuizSessionClient>
    {
        private readonly IQuizSessionBusiness _quizSessionBusiness;
        private readonly IUserContext _userContext;

        public QuizSessionHub(IQuizSessionBusiness quizBusiness,IUserContext userContext)
        {
            _quizSessionBusiness = quizBusiness;
            _userContext = userContext;
        }
        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Find which quiz session this connection belongs to
            var sessionId = QuizSessionCache.FindSessionByUserId(_userContext.UserId);

            if (sessionId != null)
            {
                QuizSessionCache.RemovePlayer(sessionId, Context.ConnectionId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);

                var players = QuizSessionCache.GetPlayers(sessionId);
                var dataSendBack = new
                {
                    players = players.Select(p => p.Name).ToList(),
                };

                await Clients.Group(sessionId).UserExitQuizSession(dataSendBack);
            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task<ReturnResult<List<string>>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO)
        {
            var result = await _quizSessionBusiness.JoinQuizSession(joinQuizSessionDTO,Context.ConnectionId);

            if (result.Result != null && result.Result.Any())
            {
                // Add user to SignalR group
                await Groups.AddToGroupAsync(Context.ConnectionId, joinQuizSessionDTO.Id);

                // Notify other users in the session
                var dataSendBack = new
                {
                    players = result.Result,
                };

                await Clients.OthersInGroup(joinQuizSessionDTO.Id).UserJoinQuizSession(dataSendBack);
            }

            return result;
        }
        public async Task LeaveQuizSession(string quizSessionId)
        {
            var players = QuizSessionCache.GetPlayers(quizSessionId);
            var playerToRemove = players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);

            if (playerToRemove != null)
            {
                QuizSessionCache.RemovePlayer(quizSessionId, Context.ConnectionId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, quizSessionId);

                var remainingPlayers = QuizSessionCache.GetPlayers(quizSessionId);
                var dataSendBack = new
                {
                    players = remainingPlayers.Select(p => p.Name).ToList(),
                };

                await Clients.OthersInGroup(quizSessionId).UserExitQuizSession(dataSendBack);
            }
        }
    }
}
