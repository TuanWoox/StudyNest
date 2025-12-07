using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Utils.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class QuizSession: BaseEntity<string>
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
        public string QuizAttemptSnapshotId { get; set; }
        public string OwnerId { get; set; }
        [JsonIgnore]
        public ApplicationUser Owner { get; set; }
        public QuizAttemptSnapshot QuizAttemptSnapshot { get; set; }
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    }
}
