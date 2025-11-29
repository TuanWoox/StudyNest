using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.Paging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuestionBusiness
    {
        Task<ReturnResult<bool>> UpdateQuestion(UpdateQuestionDTO request);
        Task<ReturnResult<bool>> CreateQuestion(CreateQuestionDTO request);
        Task<ReturnResult<bool>> DeleteQuestion(string id);
    }
}
