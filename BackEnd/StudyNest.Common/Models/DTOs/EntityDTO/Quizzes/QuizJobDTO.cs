using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Quizzes
{
    public class QuizJobDTO
    {
        public string JobId { get; set; }
        public string UserId { get; set; }
        public string NoteTitle { get; set; }
        public string Status { get; set; }
        public string? QuizId { get; set; }
        public string? ErrorMessage { get; set; }
        public string Timestamp { get; set; }
        public bool IsViewed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
