using OAuthIntegration.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OAuthIntegration.Common.DbEntities.Identities
{
    [Table("aspnetpermissions")]
    public class ApplicationPermission : BaseEntity<int>
    {
        [Required]
        [StringLength(100)]
        public string DisplayName { get; set; }
        [Required]
        public string Permission { get; set; }
        [Required]
        [StringLength(100)]
        public string Screen { get; set; }
        public virtual ICollection<RolePermission> RolePermissions { get; set; }
        public string Description { get; set; }
        [NotMapped]
        public bool IgnoreAddToAdmin { get; set; }
    }
}
