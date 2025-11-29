using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Quizzes
{
    public class CreateQuizJobResponseDTO
    {
        public string JobId { get; set; } = string.Empty;
        public string NoteTitle { get; set; } = string.Empty;
        public DateTimeOffset Timestamp { get; set; }
    }
}
