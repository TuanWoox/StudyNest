using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IAuthBusiness
    {
        public Task<ReturnResult<string>> Login(UserLogin model);
        public Task<ReturnResult<string>> Register(UserRegister model);
        public Task<ReturnResult<string>> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal);
    }
}
