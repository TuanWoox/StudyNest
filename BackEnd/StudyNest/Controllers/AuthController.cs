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

        [HttpGet("ValidateToken")]
        public IActionResult Auth()
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            result.Result = true;
            return Ok(result);
        }

        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword(UserChangePassword model)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _authBusiness.ChangePassword(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        [HttpGet("HasPassword")]
        public async Task<IActionResult> HasPassword()
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _authBusiness.HasPassword();
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        [HttpPost("SetPassword")]
        public async Task<IActionResult> SetPassword(UserSetPassword model)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            try
            {
                result = await _authBusiness.SetPassword(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        // Request a password reset email (public)
        [AllowAnonymous]
        [HttpPost("RequestPasswordReset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordReset model)
        {
            var result = new ReturnResult<bool>();
            try
            {
                result = await _authBusiness.RequestPasswordReset(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }

        // Reset password using token from email link
        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPassword model)
        {
            var result = new ReturnResult<bool>();
            try
            {
                result = await _authBusiness.ResetPassword(model);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
            }
            return Ok(result);
        }
    }
}