using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.FeedBack;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedBackController : ControllerBase
    {
        public IFeedBackBusiness _feedBackBusiness;
        public FeedBackController(IFeedBackBusiness feedBackBusiness)
        {
            this._feedBackBusiness = feedBackBusiness;
        }
        [HttpPost("GetPaging")]
        public async Task<IActionResult> GetPaging(Page<string> page, bool isExported = false)
        {
            ReturnResult<PagedData<SelectFeedBackDTO, string>> result = new ReturnResult<PagedData<SelectFeedBackDTO, string>>();
            try
            {
                result = await _feedBackBusiness.GetPaging(page, isExported);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> CreateFeedBack(CreateFeedBackDTO createFeedBackDTO)
        {
            ReturnResult<FeedBackDTO> result = new ReturnResult<FeedBackDTO>();
            try
            {
                result = await _feedBackBusiness.CreateFeedBack(createFeedBackDTO);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateFeedBack(UpdateFeedBackDTO updateFeedBackDTO)
        {
            ReturnResult<FeedBackDTO> result = new ReturnResult<FeedBackDTO>();
            try
            {
                result = await _feedBackBusiness.UpdateFeedBack(updateFeedBackDTO);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedBack(string id)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _feedBackBusiness.DeleteFeedBack(id);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
        [HttpPost("DeleteFeedBacks")]
        public async Task<IActionResult> DeleteFeedBacks(Page<string> page)
        {
            ReturnResult<int> result = new ReturnResult<int>();
            try
            {
                result = await _feedBackBusiness.DeleteFeedBacks(page.Selected);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
    }
}
