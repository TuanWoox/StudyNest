using Microsoft.AspNetCore.Identity;
using OAuthIntegration.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OAuthIntegration.Common.DbEntities.Identities
{
    public class ApplicationUserRole : IdentityUserRole<string>, IModified, ICreated, IDeleted
    {
        public virtual ApplicationUser User { get; set; }
        public virtual ApplicationRole Role { get; set; }

        public bool Deleted { get; set; } = false;
        public DateTimeOffset? DateDeleted { get; set; }
        public virtual DateTimeOffset? DateCreated { get; set; }

        public virtual DateTimeOffset? DateModified { get; set; }
    }
}
