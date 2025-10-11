using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.User;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IAuthBusiness _authBusiness;
        public AuthController(IAuthBusiness authBusiness)
        {
            this._authBusiness = authBusiness;
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login(UserLogin model)
        {
            ReturnResult<string> result = new ReturnResult<string>();
            try
            {
                result = await _authBusiness.Login(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("Login/Google")]
        public IResult GoogleLogin(
            [FromQuery] string returnUrl,
            [FromServices] LinkGenerator linkGenerator,
            [FromServices] SignInManager<ApplicationUser> signManager)
        {
            var properties = signManager.ConfigureExternalAuthenticationProperties("Google",
                linkGenerator.GetPathByName(HttpContext, "GoogleLoginCallback") + $"?returnUrl={returnUrl}");
            return Results.Challenge(properties, ["Google"]);
        }

        [AllowAnonymous]
        [HttpGet("Login/Google/Callback", Name = "GoogleLoginCallback")]
        public async Task<IResult> GoogleLoginCallback([FromQuery] string returnUrl)
        {
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            if (!result.Succeeded)
            {
                return Results.Unauthorized();
            }
            var loginResult = await _authBusiness.LoginWithGoogleAsync(result.Principal);
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            var redirectUrl = $"{returnUrl}?token={Uri.EscapeDataString(loginResult.Result)}";
            return Results.Redirect(redirectUrl);
        }

        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<IActionResult> Register(UserRegister model)
        {
            ReturnResult<string> result = new ReturnResult<string>();
            try
            {
                result = await _authBusiness.Register(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        [HttpGet]
        public IActionResult Auth()
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            result.Result = true;
            return Ok(result);
        }
    }
}