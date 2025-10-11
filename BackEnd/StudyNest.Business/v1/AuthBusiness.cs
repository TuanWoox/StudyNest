using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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

                // Re-fetch user by username to ensure tracking consistency
                var createdUser = await _userManager.FindByNameAsync(model.Username);
                if (createdUser == null)
                {
                    result.Message += $" User '{model.Username}' could not be retrieved after creation.";
                }
                else
                {
                    // Assign role
                    var roleResult = await _userManager.AddToRoleAsync(createdUser, UserRoleEnum.user.ToString());
                    if (!roleResult.Succeeded)
                    {
                        result.Message += " Failed to assign role: " + string.Join(", ", roleResult.Errors.Select(e => e.Description));
                    }

                    // Re-fetch by email to ensure latest tracking state
                    createdUser = await _userManager.FindByEmailAsync(model.Email);
                    if (createdUser == null)
                    {
                        result.Message += $" User '{model.Username}' could not be retrieved by email after role assignment.";
                    }
                    else
                    {
                        // Confirm email
                        var token = await _userManager.GenerateEmailConfirmationTokenAsync(createdUser);
                        var confirmResult = await _userManager.ConfirmEmailAsync(createdUser, token);
                        if (!confirmResult.Succeeded)
                        {
                            result.Message += " Email confirmation failed: " + string.Join(", ", confirmResult.Errors.Select(e => e.Description));
                        }
                    }
                }

                // If no message yet, registration succeeded
                if (string.IsNullOrEmpty(result.Message))
                {
                    result.Result = await GenerateJwtToken(newUser, false);
                }
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

                    //Fetch again for not tracking the same entity
                    var createdUser = await _userManager.FindByNameAsync(email);

                    // Assign default user role
                    if (await _roleManager.RoleExistsAsync(UserRoleEnum.user.ToString()))
                    {
                        await _userManager.AddToRoleAsync(createdUser, UserRoleEnum.user.ToString());
                    }

                    user = createdUser;
                }

                // Add external login info if not already linked
                var info = new UserLoginInfo(
                    "Google",
                    claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.NewGuid().ToString(),
                    "Google"
                );

                //Fetch again for not tracking the same entity
                user = await _userManager.FindByEmailAsync(email);

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
    }
}
