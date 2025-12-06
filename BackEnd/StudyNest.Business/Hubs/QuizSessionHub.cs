using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StudyNest.Business.v1;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;

namespace StudyNest.Business.Hubs
{
    public interface IQuizSessionClient
    {
        Task UserJoinQuizSession(object dataSendBack);
        Task UserExitQuizSession(object dataSendBack);
    }

    [Authorize]
    public class QuizSessionHub : Hub<IQuizSessionClient>
    {
        private readonly IQuizSessionBusiness _quizSessionBusiness;
        private readonly IUserContext _userContext;

        // Track what quiz each connection has joined
        private static readonly Dictionary<string, string> _connectionToQuizMap = new();

        public QuizSessionHub(IQuizSessionBusiness quizBusiness, IUserContext userContext)
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
            if (_connectionToQuizMap.TryGetValue(Context.ConnectionId, out var sessionId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);

                var dataSendBack = new
                {
                    _userContext.UserId,
                    QuizSessionId = sessionId
                };

                await Clients.Group(sessionId).UserExitQuizSession(dataSendBack);

                _connectionToQuizMap.Remove(Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO)
        {
            var result = await _quizSessionBusiness.JoinQuizSession(joinQuizSessionDTO);

            if (!result.Result)
            {
                await Clients.Caller.UserJoinQuizSession(new
                {
                    Result = false,
                    Message = result.Message ?? "Invalid PIN"
                });
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, joinQuizSessionDTO.Id);

            _connectionToQuizMap[Context.ConnectionId] = joinQuizSessionDTO.Id;
            var dataSendBack = new
            {
                _userContext.UserId,
                QuizSessionId = joinQuizSessionDTO.Id
            };

            await Clients.OthersInGroup(joinQuizSessionDTO.Id).UserJoinQuizSession(dataSendBack);
        }
        public async Task LeaveQuizSession(string quizSessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, quizSessionId);

            if (_connectionToQuizMap.ContainsKey(Context.ConnectionId))
                _connectionToQuizMap.Remove(Context.ConnectionId);

            var dataSendBack = new
            {
                _userContext.UserId,
                QuizSessionId = quizSessionId
            };

            await Clients.OthersInGroup(quizSessionId).UserExitQuizSession(dataSendBack);
        }
    }
}
