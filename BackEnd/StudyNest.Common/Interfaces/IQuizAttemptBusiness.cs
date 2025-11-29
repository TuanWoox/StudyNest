using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptAnswer;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Models.Paging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuizAttemptBusiness
    {
        public Task<ReturnResult<PagedData<SelectQuizAttemptDTO, string>>> GetPaging(Page<string> page, bool isExported = false);
        public Task<ReturnResult<PagedData<SelectQuizAttemptDTO, string>>> GetPagingByQuizId(Page<string> page, string quizId, bool isExported = false);
        public Task<ReturnResult<QuizAttemptDTO>> GetOneById(string id);
        public Task<ReturnResult<string>> SubmitQuizAttempt(string quizAttemptSnapshotId, List<CreateQuizAttemptAnswerDTO> submittedAnswers);
        public Task<ReturnResult<QuizAttemptDTO>> CreateQuizAttempt(CreateQuizAttemptDTO newEntity);
    }
}
