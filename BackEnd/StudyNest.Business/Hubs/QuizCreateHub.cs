using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Business.Hubs
{
    public interface IQuizCreateHub
    {
        Task CreateStarted(string jobId, string noteTitle, DateTimeOffset timestamp);
        Task CreateFinished(string jobId, bool success, string? quizId, string? errorMessage);
    }
    public class QuizCreateHub : Hub<IQuizCreateHub>
    {

    }
}
