using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Data;

namespace StudyNest.Business.v1
{
    public class UserBusiness: IUserBusiness
    {
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserBusiness(ApplicationDbContext context, RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
        }


        #region Init Role Data
        private async Task InitRoleData()
        {
            try
            {
                var roleNames = Enum.GetNames(typeof(UserRoleEnum)).ToList();
                foreach(var roleName in roleNames)
                {
                    var roleExist = await _roleManager.RoleExistsAsync(roleName);
                    if(!roleExist)
                    {
                        var newRole = new ApplicationRole
                        {
                            Name = roleName,
                            NormalizedName = roleName.ToUpper(),
                            DisplayName = roleName,
                            DateCreated = DateTimeOffset.UtcNow,
                            Deleted = false,
                        };
                        var result = await _roleManager.CreateAsync(newRole);
                        if(!result.Succeeded)
                        {
                            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                            StudyNestLogger.Instance.Error($"Failed to create role '{roleName}': {errors}");
                            throw new InvalidOperationException($"Failed to create role '{roleName}': {errors}");
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error($"An error occurred while initializing roles: {ex.Message}", ex);
                throw;
            }
        }
        #endregion

        #region Init Default User Data
        private async Task InitUserData(UserRoleEnum role, string username = "user")
        {
            try
            {
                StudyNestLogger.Instance.Debug($"InitUserData for role: {role}");

                // Check if role exists
                var existingRole = await _context.Roles
                    .FirstOrDefaultAsync(r => r.Name == role.ToString());
                if (existingRole == null)
                {
                    throw new InvalidOperationException(
                        $"Role '{role}' does not exist. Please initialize roles first."
                    );
                }

                // Check if user already exists
                var existingUser = await _userManager.FindByNameAsync(username);
                if (existingUser != null)
                {
                    StudyNestLogger.Instance.Debug(
                        $"User '{username}' already exists. Skipping creation."
                    );
                    return;
                }

                // Create new user
                var newUser = new ApplicationUser
                {
                    UserName = username,
                    FullName = username,
                    Email = $"{username}@primas.net",
                    EmailConfirmed = true,
                    DateOfBirth = DateTimeOffset.UtcNow,
                    Deleted = false,
                    DateCreated = DateTimeOffset.UtcNow
                };

                string password = $"{char.ToUpper(username[0])}{username.Substring(1)}@123";
                var result = await _userManager.CreateAsync(newUser, password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create user: {errors}");
                }

                // Assign role (newUser is already tracked by UserManager after CreateAsync)
                await _userManager.AddToRoleAsync(newUser, role.ToString());

                // Confirm email
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
                await _userManager.ConfirmEmailAsync(newUser, token);

                StudyNestLogger.Instance.Debug(
                    $"User '{username}' created, assigned role '{role}', and email confirmed successfully."
                );
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(
                    $"An error occurred while initializing user '{username}': {ex.Message}",
                    ex
                );
                throw;
            }
        }
        #endregion

        #region Function To Init All The Default Data For User
        public async Task InitData()
        {
            try
            {
                await InitRoleData();
                await InitUserData(UserRoleEnum.user, "tuanwoox");
                await InitUserData(UserRoleEnum.admin, "tuanwooxadmin");
            } 
            catch(Exception ex)
            {
                StudyNestLogger.Instance.Error($"An error occurred while initializing user data: {ex.Message}", ex);
            }
        }
        #endregion
    }
}
