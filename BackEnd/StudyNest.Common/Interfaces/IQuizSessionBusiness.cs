using StudyNest.Common.Models.DTOs.CoreDTO;
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
        public Task<ReturnResult<bool>> TerminateQuizSessionAfterLongTimeNotStarted(string quizSessionId);
        public Task<ReturnResult<bool>> JoinQuizSession(JoinQuizSessionDTO joinQuizSessionDTO);
        public Task<ReturnResult<bool>> StartQuiz(string quizSessionId);
        public Task<ReturnResult<string>> GetQuizIdByQuizSessionId(string quizSessionId);
    }
}
