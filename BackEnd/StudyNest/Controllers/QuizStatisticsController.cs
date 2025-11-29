using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.ViewDTO.QuizStatistic;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizStatisticsController : ControllerBase
    {
        public IQuizStatisticsBusiness _quizStatisticsBusiness;
        public QuizStatisticsController(IQuizStatisticsBusiness quizStatisticsBusiness)
        {
            this._quizStatisticsBusiness = quizStatisticsBusiness;
        }
        [HttpPost("{quizId}")]
        public async Task<IActionResult> GetQuizStatisticsById(string quizId, DateFilter dateFilter)
        {
            ReturnResult<QuizStatisticsDTO> result = new ReturnResult<QuizStatisticsDTO>();
            try
            {
                result =  await _quizStatisticsBusiness.GetOneById(quizId, dateFilter);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
    }
}
