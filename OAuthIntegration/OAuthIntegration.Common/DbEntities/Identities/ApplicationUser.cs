using OAuthIntegration.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace OAuthIntegration.Common.DbEntities.Identities
{
    public class ApplicationUser : IdentityUser, IBaseKey<string>, ICreated, IModified, IDeleted
    {

        public string FullName { get; set; }

        public DateTimeOffset DateOfBirth { get; set; }

        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
        public string? Language { get; set; }
        public string? ThemePreference { get; set; }

        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
        public DateTimeOffset? DateCreated { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DateModified { get; set; } = DateTimeOffset.UtcNow;

        public bool Deleted { get; set; } = false;
        public DateTimeOffset? DateDeleted { get; set; } = null;

    }
}
