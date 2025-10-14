using Microsoft.AspNetCore.SignalR;

namespace StudyNest.Business.Hubs
{
    public interface IQuizAttemptSnapshotClient
    {
        Task CompleteCreateQuizAttemptSnapshot(object dataSendBack);
        Task ReloadQuizAttemptSnapshot(object datasendBack);
    }
    public class QuizAttemptSnapshotHub: Hub<IQuizAttemptSnapshotClient>
    {
    }
}
