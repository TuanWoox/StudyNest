using AutoMapper;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt;
using StudyNest.Common.Utils.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.QuizSession
{
    [AutoMap(typeof(DbEntities.Entities.QuizSession), ReverseMap = true, PreserveReferences = true)]
    public class QuizSessionDTO: BaseEntity<string>
    {
        public QuizSessionStatus Status { get; set; } = QuizSessionStatus.NotStarted;
        [Length(6, 6)]
        [Required]
        public string GamePin { get; set; } = string.Empty;
        public int CurrentQuestionIndex { get; set; } = 0;
        [Required]
        [Range(20, 30)]
        public int TimeForEachQuestion { get; set; } = 0; // in seconds
        public DateTimeOffset? DateTimeEnded { get; set; }
        public string OwnerId { get; set; }
        public string QuizAttemptSnapshotId { get; set; }
        public ICollection<QuizAttemptDTO> QuizAttempts { get; set; } = new List<QuizAttemptDTO>();
    }
}
