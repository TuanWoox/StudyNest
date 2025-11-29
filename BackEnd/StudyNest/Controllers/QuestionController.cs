using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Business.v1;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionBusiness _questionBusiness;

        public QuestionController(IQuestionBusiness questionBusiness)
        {
            this._questionBusiness = questionBusiness;
        }
        [HttpPost]
        public async Task<IActionResult> CreateQuiz(CreateQuestionDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                rs = await _questionBusiness.CreateQuestion(request);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateQuestion(UpdateQuestionDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                rs = await _questionBusiness.UpdateQuestion(request);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(string id)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                rs = await _questionBusiness.DeleteQuestion(id);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
    }
}
