using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using OAuthIntegration.Common.DbEntities.Identities;
using OAuthIntegration.Common.Models.DTOs.CoreDTO;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using OAuthIntegration.Data;
using System.IdentityModel.Tokens.Jwt;
using OAuthIntegration.Common.Utils.Extensions;
using OAuthIntegration.Common.Utils.Enum;
using OAuthIntegration.Common.Utils.Helper;
using OAuthIntegration.Common.Interface;

namespace OAuthIntegration.Business.v1
{
    public class AuthBusiness: IAuthBusiness
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _appDbContext;

        public AuthBusiness(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext applicationDbContext
        )
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _appDbContext = applicationDbContext;
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user, bool rememberMe)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = rememberMe ? DateTime.UtcNow.AddDays(365) : DateTime.UtcNow.AddDays(30),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        public async Task<ReturnResult<string>> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal)
        {
            var result = new ReturnResult<string>();
            try
            {
                if (claimsPrincipal == null)
                {
                    result.Message = "Invalid Google login information.";
                    return result;
                }

                var email = claimsPrincipal.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(email))
                {
                    result.Message = "Google account does not provide an email address.";
                    return result;
                }

                var user = await _userManager.FindByEmailAsync(email);

                // If user does not exist, create one
                if (user == null)
                {
                    var fullName = $"{claimsPrincipal.FindFirstValue(ClaimTypes.Name) ?? email}".Trim();
                    var newUser = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = fullName,
                        EmailConfirmed = true,
                        DateCreated = DateTimeOffset.UtcNow,
                        DateOfBirth = DateTimeOffset.UtcNow,
                    };

                    var createResult = await _userManager.CreateAsync(newUser);
                    if (!createResult.Succeeded)
                    {
                        result.Message = "Unable to create user from Google login: " +
                                         string.Join(", ", createResult.Errors.Select(e => e.Description));
                        return result;
                    }

                    // Assign default user role
                    if (await _roleManager.RoleExistsAsync(UserRoleEnum.user.ToString()))
                    {
                        await _userManager.AddToRoleAsync(newUser, UserRoleEnum.user.ToString());
                    }

                    user = newUser;
                }

                // Add external login info if not already linked
                var info = new UserLoginInfo(
                    "Google",
                    claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.NewGuid().ToString(),
                    "Google"
                );

                var userLogins = await _userManager.GetLoginsAsync(user);
                if (!userLogins.Any(l => l.LoginProvider == "Google"))
                {
                    var loginResult = await _userManager.AddLoginAsync(user, info);
                    if (!loginResult.Succeeded)
                    {
                        result.Message = "Failed to link Google account: " +
                                         string.Join(", ", loginResult.Errors.Select(e => e.Description));
                        return result;
                    }
                }

                // Generate JWT token for the authenticated user
                result.Result = await GenerateJwtToken(user, true);
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                OauthIntegrationLogger.Instance.Error(ex);
            }

            return result;
        }
    }
}
