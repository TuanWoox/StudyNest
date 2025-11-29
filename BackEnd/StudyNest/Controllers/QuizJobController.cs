using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizJobController : ControllerBase
    {
        private readonly IQuizJobBusiness _quizJobBusiness;

        public QuizJobController(IQuizJobBusiness quizJobBusiness)
        {
            this._quizJobBusiness = quizJobBusiness;
        }

        [HttpGet("processing")]
        public async Task<IActionResult> GetProcessing()
        {
            var rs = new ReturnResult<List<QuizJobDTO>> ();
            try
            {
                rs = await _quizJobBusiness.GetProcessingQuizJob();
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent(long sinceEpochMs)
        {
            var rs = new ReturnResult<List<QuizJobDTO>>();
            try
            {
                rs = await _quizJobBusiness.GetRecentQuizJob(sinceEpochMs);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
    }
}
