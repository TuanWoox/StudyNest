using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Business.v1;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptAnswer;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizAttemptController : ControllerBase
    {
        IQuizAttemptBusiness _quizAttemptBusiness;
        public QuizAttemptController(IQuizAttemptBusiness quizAttemptBusiness)
        {
            _quizAttemptBusiness = quizAttemptBusiness;
        }
        [HttpPost("GetPaging")]
        public async Task<IActionResult> GetPaging(Page<string> page, bool isExported = false)
        {
            ReturnResult<PagedData<SelectQuizAttemptDTO, string>> result = new ReturnResult<PagedData<SelectQuizAttemptDTO, string>>();
            try
            {
                result = await _quizAttemptBusiness.GetPaging(page, isExported);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPost("GetPagingByQuizId")]
        public async Task<IActionResult> GetPagingByQuizId(Page<string> page, string quizId , bool isExported = false)
        {
            ReturnResult<PagedData<SelectQuizAttemptDTO, string>> result = new ReturnResult<PagedData<SelectQuizAttemptDTO, string>>();
            try
            {
                result = await _quizAttemptBusiness.GetPagingByQuizId(page, quizId, isExported);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneById(string id)
        {
            ReturnResult<QuizAttemptDTO> result = new ReturnResult<QuizAttemptDTO>();
            try
            {
                result = await _quizAttemptBusiness.GetOneById(id);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPost("SubmitQuizAttempt/{quizAttemptSnapshotId}")]
        public async Task<IActionResult> SubmitQuizAttempt(string quizAttemptSnapshotId, [FromBody] List<CreateQuizAttemptAnswerDTO> submittedAnswers)
        {
            ReturnResult<string> result = new ReturnResult<string>();
            try
            {
                result = await _quizAttemptBusiness.SubmitQuizAttempt(quizAttemptSnapshotId, submittedAnswers);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPost("SubmitQuizAnswerForQuizSession")]
        public async Task<IActionResult> SubmitQuizAnswerForQuizSession([FromBody] CreateQuizAttemptAnswerDTO submittedAnswer)
        {
            ReturnResult<QuizAttemptAnswerDTO> result = new ReturnResult<QuizAttemptAnswerDTO>();
            try
            {
                result = await _quizAttemptBusiness.CreateOneAnswerForQuizSession(submittedAnswer);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
    }
}
