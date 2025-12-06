using StudyNest.Common.DbEntities.BaseEntity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.DbEntities.Entities
{
    public class QuizAttemptSnapshot: BaseEntity<string>
    {
        [Required]
        public string QuizId { get; set; }

        public Quiz Quiz { get; set; }

        //This store a snapshot of the quiz questions at the time of the attempt
        [Column(TypeName = "jsonb")]
        public string QuizQuestions { get; set; }
        public ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
        public ICollection<QuizSession> QuizSessions { get; set; } = new List<QuizSession>();
    }
}
