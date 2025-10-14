using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Identities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class QuizAttempt: BaseEntity<string>
    {
        [Required]
        public string QuizId { get; set; }
        public Quiz Quiz { get; set; }
        [Required]
        public string UserId { get; set; }
        [JsonIgnore]
        public ApplicationUser User { get; set; }
        [Required]
        public string QuizAttemptSnapshotId { get; set; }
        public QuizAttemptSnapshot  QuizAttemptSnapshot { get; set; }
        public int Score { get; set; }
        public ICollection<QuizAttemptAnswer> QuizAttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();
    }
}
