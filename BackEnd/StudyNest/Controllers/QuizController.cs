using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Expressions.Internal;
using StudyNest.Business.v1;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IQuizBusiness _quizBusiness;

        public QuizController(IQuizBusiness quizBusiness)
        {
            this._quizBusiness = quizBusiness;
        }

        [HttpPost("GetPaging")]
        public async Task<IActionResult> GetAllQuizByUserId(Page<string> page, bool isExported = false)
        {
            var rs = new ReturnResult<PagedData<QuizListDTO, string>> ();
            try
            {
                rs = await _quizBusiness.GetAllQuizByUserId(page, isExported);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizDetail(string id)
        {
            var rs = new ReturnResult<Quiz>();
            try
            {
                rs = await _quizBusiness.GetQuizDetail(id);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpPost]
        public async Task<IActionResult> CreateQuiz(CreateQuizDTO request)
        {
            var rs = new ReturnResult<CreateQuizJobResponseDTO>();
            try
            {
                rs = await _quizBusiness.EnqueueGenerateAsync(request);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpPost("manual")]
        public async Task<IActionResult> CreateQuizFromScratch(CreateManualQuizDTO request)
        {
            var rs = new ReturnResult<string>();
            try
            {
                rs = await _quizBusiness.CreateQuizFromScratch(request);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateQuiz(UpdateQuizDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                rs = await _quizBusiness.UpdateQuiz(request);
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
                rs = await _quizBusiness.DeleteById(id);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
        [HttpGet("validate-note-length")]
        public async Task<IActionResult> ValidateNoteLength(string noteId)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                rs = await _quizBusiness.ValidateNoteContent(noteId);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(rs);
        }
    }
}
