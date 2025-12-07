using Microsoft.AspNetCore.Http;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Security
{
    public class HttpUserContext : IUserContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public HttpUserContext(IHttpContextAccessor httpContextAccessor)
            => _httpContextAccessor = httpContextAccessor;

        public string UserId => _httpContextAccessor.HttpContext?.User?.GetUserId() ?? "";
        public bool IsAdmin => _httpContextAccessor.HttpContext?.User?.IsInRole(UserRoleEnum.admin.ToString()) ?? false;
        public string UserName => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value ?? "";

        public string Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value ?? "";
    }
}
