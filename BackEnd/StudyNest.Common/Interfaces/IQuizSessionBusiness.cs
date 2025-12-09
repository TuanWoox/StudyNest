using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuizSessionBusiness
    {
        public Task<ReturnResult<QuizSessionDTO>> CreateQuizSession(CreateQuizSessionDTO newEntity);
        public Task<ReturnResult<QuizSessionDTO>> GetQuizSessionById(string id);
        public Task<ReturnResult<QuizSessionDTO>> GetActiveQuizSessionByQuizId(string quizId);
        public Task<ReturnResult<bool>> TerminateQuizSessionAfterLongTimeNotStarted(string quizSessionId);
        public Task<ReturnResult<List<string>>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO, string connectionId);
        public Task<ReturnResult<bool>> StartQuizSession(string quizSessionId);
        public Task<ReturnResult<string>> GetQuizIdByQuizSessionId(string quizSessionId);
        public Task<ReturnResult<bool>> TriggerSubmitAnswer(string quizSessionId, QuizAttemptSnapshotDTO snapshot);
        public Task<ReturnResult<bool>> TerminateQuizSession(string id);
    }
}
