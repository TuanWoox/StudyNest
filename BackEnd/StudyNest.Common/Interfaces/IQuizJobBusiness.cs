using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuizJobBusiness
    {
        Task<ReturnResult<List<QuizJobDTO>>> GetProcessingQuizJob();
        Task<ReturnResult<List<QuizJobDTO>>> GetRecentQuizJob(long sinceEpochMs);

    }
}
