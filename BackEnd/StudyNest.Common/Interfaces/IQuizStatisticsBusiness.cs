using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.ViewDTO.QuizStatistic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuizStatisticsBusiness
    {
        Task<ReturnResult<QuizStatisticsDTO>> GetOneById(string quizId, DateFilter dateFilter);
    }
}
