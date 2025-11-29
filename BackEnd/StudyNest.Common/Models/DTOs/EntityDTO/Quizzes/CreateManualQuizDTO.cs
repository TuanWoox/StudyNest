using StudyNest.Common.Attributes;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Quizzes
{
    public class CreateManualQuizDTO
    {
        public string Title { get; set; } = "Quiz Title";
        public string Difficulty { get; set; } = "Medium";
        public List<QuestionUpsertDTO> Questions { get; set; } = new();
    }
}
