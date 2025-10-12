using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using OAuthIntegration.Common.Models.DTOs.CoreDTO;

namespace OAuthIntegration.Common.Interface
{
    public interface IAuthBusiness
    {
        public Task<ReturnResult<string>> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal);
    }
}
