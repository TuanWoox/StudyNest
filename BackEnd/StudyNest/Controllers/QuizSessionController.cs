using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizSession;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizSessionController : ControllerBase
    {
        IQuizSessionBusiness _quizSessionBusiness;
        public QuizSessionController(IQuizSessionBusiness quizSessionBusiness)
        {
            this._quizSessionBusiness = quizSessionBusiness;
        }
        [HttpPost]
        public async Task<IActionResult> CreateQuizSession(CreateQuizSessionDTO newEntity)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                result = await _quizSessionBusiness.CreateQuizSession(newEntity);
            }
            catch (Exception ex)
            {
               StudyNestLogger.Instance.Error(ex.Message);
            }
            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizSessionById(string id)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                result = await _quizSessionBusiness.GetQuizSessionById(id);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return Ok(result);
        }
        [HttpGet("GetActiveQuizSession/{quizId}")]
        public async Task<IActionResult> GetActiveQuizSessionByQuizId(string quizId)
        {
            ReturnResult<QuizSessionDTO> result = new ReturnResult<QuizSessionDTO>();
            try
            {
                result = await _quizSessionBusiness.GetActiveQuizSessionByQuizId(quizId);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return Ok(result);
        }
        [HttpPut("Start/{id}")]
        public async Task<IActionResult> StartQuizSession(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _quizSessionBusiness.StartQuizSession(id);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return Ok(result);
        }
        [HttpPut("Terminate/{id}")]
        public async Task<IActionResult> TerminateQuizSession(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _quizSessionBusiness.TerminateQuizSession(id);
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.Message);
            }
            return Ok(result);
        }
    }
}