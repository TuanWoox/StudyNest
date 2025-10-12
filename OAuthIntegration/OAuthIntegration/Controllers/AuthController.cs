using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OAuthIntegration.Common.DbEntities.Identities;
using OAuthIntegration.Common.Interface;

namespace OAuthIntegration.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        IAuthBusiness _authBusiness;
        public AuthController(IAuthBusiness authBusiness)
        {
            this._authBusiness = authBusiness;
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
    }
}
