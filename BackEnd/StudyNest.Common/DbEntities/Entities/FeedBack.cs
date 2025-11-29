using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Utils.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class FeedBack: BaseEntity<string>
    {

        public int Rating { get; set; } = 0;
        [Required]
        public string Category { get; set; }
        [Required]
        public string Description { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public FeedBackStatus Status { get; set; } = FeedBackStatus.Pending;
        public string? RejectedReason { get; set; }
    }
}
