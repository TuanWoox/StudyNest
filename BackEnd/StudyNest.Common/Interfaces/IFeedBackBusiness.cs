using CloudinaryDotNet.Actions;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.FeedBack;
using StudyNest.Common.Models.Paging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IFeedBackBusiness
    {
        public Task<ReturnResult<PagedData<SelectFeedBackDTO,string>>> GetPaging(Page<string> page, bool isExported = false);
        public Task<ReturnResult<FeedBackDTO>> CreateFeedBack(CreateFeedBackDTO createFeedBackDTO);
        public Task<ReturnResult<FeedBackDTO>> UpdateFeedBack(UpdateFeedBackDTO updateFeedBackDTO);
        public Task<ReturnResult<bool>> DeleteFeedBack(string id);
        public Task<ReturnResult<int>> DeleteFeedBacks(List<string> ids);
    }
}
