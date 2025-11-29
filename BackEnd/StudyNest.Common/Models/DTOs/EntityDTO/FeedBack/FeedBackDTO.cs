using AutoMapper;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Utils.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.FeedBack
{
    [AutoMap(typeof(DbEntities.Entities.FeedBack), ReverseMap = true, PreserveReferences = true)]
    public class FeedBackDTO: BaseEntity<string>
    {
        public int Rating { get; set; } = 0;
        public string Category { get; set; }
        public string Description { get; set; }
        public string UserId { get; set; }
        public FeedBackStatus Status { get; set; } = FeedBackStatus.Pending;
        public string? RejectedReason { get; set; }
    }
}
