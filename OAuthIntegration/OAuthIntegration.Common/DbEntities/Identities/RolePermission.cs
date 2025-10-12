using OAuthIntegration.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OAuthIntegration.Common.DbEntities.Identities
{
    [Table("aspnetrolepermissions")]
    public class RolePermission : BaseEntity<int>
    {
        public string RoleId { get; set; }
        [ForeignKey("RoleId")]
        public virtual ApplicationRole Role { get; set; }
        public int PermissionId { get; set; }
        [ForeignKey("PermissionId")]
        public virtual ApplicationPermission Permission { get; set; }
    }
}
