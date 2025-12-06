using StudyNest.Common.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.QuizSession
{
    public class CreateQuizSessionDTO
    {
        [TrimmedRequired]
        public string QuizId { get; set; }
        [Required]
        [Length(6, 6)]
        public string GamePin { get; set; } = string.Empty;
        [Required]
        [Range(20, 30)]
        public int TimeForEachQuestion { get; set; } = 0; // in seconds
    }
}
