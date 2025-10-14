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
    [Table("Quizzes")]
    public class Quiz : BaseEntity <string>
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string OwnerId { get; set; }
        [JsonIgnore]
        public ApplicationUser Owner { get; set; }
        public string NoteId { get; set; }
        public Note Note { get; set; }
        public bool IsBeingConvertToSnapShot { get; set; } = false;
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    }
}
