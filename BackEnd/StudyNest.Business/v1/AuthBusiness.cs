using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.User;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class AuthBusiness : IAuthBusiness
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _appDbContext;
        private readonly IUserContext _userContext;
        private readonly IEmailBusiness _emailBusiness;
        private readonly ISettingBusiness _settingBusiness;

        public AuthBusiness(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext applicationDbContext,
            IUserContext userContext,
            IEmailBusiness emailBusiness,
            ISettingBusiness settingBusiness
        )
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _appDbContext = applicationDbContext;
            _userContext = userContext;
            _emailBusiness = emailBusiness;
            _settingBusiness = settingBusiness;
        }

        public async Task<ReturnResult<string>> Login(UserLogin model)
        {
            var result = new ReturnResult<string>();

            try
            {
                ApplicationUser? user = null;

                if (new EmailAddressAttribute().IsValid(model.UserNameOrEmail))
                    user = await _userManager.FindByEmailAsync(model.UserNameOrEmail);
                else
                    user = await _userManager.FindByNameAsync(model.UserNameOrEmail);

                if (user == null)
                {
                    result.Message = "User not found";
                    return result;
                }

                var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
                if (!isPasswordValid)
                {
                    result.Message = "Password is incorrect";
                    return result;
                }

                result.Result = await GenerateJwtToken(user, model.RememberMe);
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task<ReturnResult<string>> Register(UserRegister model)
        {
            var result = new ReturnResult<string>();
            try
            {
                var existingRole = await _appDbContext.Roles
                    .FirstOrDefaultAsync(r => r.Name == UserRoleEnum.user.ToString());
                if (existingRole == null)
                {
                    result.Message = "User role not found";
                    return result;
                }

                // Check if username or email already exists
                if (await _userManager.FindByNameAsync(model.Username) != null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST, model.Username);
                    return result;
                }
                if (await _userManager.FindByEmailAsync(model.Email) != null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_EXIST, model.Email);
                    return result;
                }

                var newUser = new ApplicationUser
                {
                    UserName = model.Username,
                    FullName = model.FullName,
                    Email = model.Email,
                    EmailConfirmed = true,
                    DateOfBirth = DateTimeOffset.UtcNow,
                    Deleted = false,
                    DateCreated = DateTimeOffset.UtcNow
                };

                var createResult = await _userManager.CreateAsync(newUser, model.Password);
                if (!createResult.Succeeded)
                {
                    result.Message = "Failed to create user: " + string.Join(", ", createResult.Errors.Select(e => e.Description));
                    return result;
                }

                // Assign role
                var roleResult = await _userManager.AddToRoleAsync(newUser, UserRoleEnum.user.ToString());
                if (!roleResult.Succeeded)
                {
                    result.Message = "Failed to assign role: " + string.Join(", ", roleResult.Errors.Select(e => e.Description));
                    return result;
                }

                // Confirm email
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
                var confirmResult = await _userManager.ConfirmEmailAsync(newUser, token);
                if (!confirmResult.Succeeded)
                {
                    result.Message = "Email confirmation failed: " + string.Join(", ", confirmResult.Errors.Select(e => e.Description));
                    return result;
                }

                // Registration succeeded
                result.Result = await GenerateJwtToken(newUser, false);
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
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
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        
        public async Task<ReturnResult<bool>> ChangePassword(UserChangePassword model)
        {
            var result = new ReturnResult<bool>();
            try
            {
                var userId = _userContext.UserId;
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    result.Message = "User not found.";
                    return result;
                }

                var changeResult = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (!changeResult.Succeeded)
                {
                    result.Message = "Password change failed: " +
                        string.Join(",", changeResult.Errors.Select(e => e.Description));
                    return result;
                }

                result.Result = true;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        
        public async Task<ReturnResult<bool>> HasPassword()
        {
            var result = new ReturnResult<bool>();
            try
            {
                var userId = _userContext.UserId;
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    result.Message = "User not found.";
                    return result;
                }

                var hasPwd = await _userManager.HasPasswordAsync(user);
                result.Result = hasPwd;
            }
            catch (Exception ex) 
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        
        public async Task<ReturnResult<bool>> SetPassword(UserSetPassword model)
        {
            var result = new ReturnResult<bool>();
            try
            {
                var userId = _userContext.UserId;
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    result.Message = "User not found.";
                    return result;
                }

                var hasPwd = await _userManager.HasPasswordAsync(user);
                if (hasPwd)
                {
                    result.Message = "Account already has a password. Use ChangePassword endpoint instead.";
                    return result;
                }

                var addResult = await _userManager.AddPasswordAsync(user, model.NewPassword);
                if (!addResult.Succeeded)
                {
                    result.Message = "Set password failed: " +
                        string.Join(", ", addResult.Errors.Select(e => e.Description));
                    return result;
                } 
                result.Result = true;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }

        public async Task<ReturnResult<bool>> RequestPasswordReset(RequestPasswordReset model)
        {
            var result = new ReturnResult<bool>();
            var passwordResetUrl = (await _settingBusiness.GetOneByKeyAndGroup("PASSWORD_RESET_URL", "FRONT_END", true)).Result?.Value;
            try
            {
                // Do not reveal if email exists — always return success.
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    result.Message = "No account found matching this email address. Please try again.";
                    return result;
                }
                    // Generate token and build frontend reset URL
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = Uri.EscapeDataString(token);

                                    // Frontend reset URL should be configured, e.g.
                var frontendResetBase = passwordResetUrl ?? _configuration["Frontend:PasswordResetUrl"];

                var resetLink = $"{frontendResetBase}?email={Uri.EscapeDataString(user.Email)}&token={encodedToken}";

                var subject = "StudyNest — Reset your password";

                var emailTemplate = (await _settingBusiness.GetOneByKeyAndGroup("FORGOT_PASSWORD_EMAIL", "EMAIL_TEMPLATE", true)).Result?.Value;

                var body = emailTemplate?.Replace("{resetLink}", resetLink);

                result = await _emailBusiness.SendAsync(user.Email, subject, body);
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }

        public async Task<ReturnResult<bool>> ResetPassword(ResetPassword model)
        {
            var result = new ReturnResult<bool>();
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    result.Message = "Invalid token or email.";
                    return result;
                }

                // token may be URL-encoded when received via query; server should expect that
                var token = Uri.UnescapeDataString(model.Token ?? string.Empty);

                var resetResult = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
                if (!resetResult.Succeeded)
                {
                    result.Message = "Reset failed: " + string.Join(", ", resetResult.Errors.Select(e => e.Description));
                    return result;
                }

                result.Result = true;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
    }
}
