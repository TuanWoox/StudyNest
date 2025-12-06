using StudyNest.Common.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.QuizSession
{
    public class JoinQuizSessionDTO
    {
        [TrimmedRequired]
        public string Id { get; set; }
        [TrimmedRequired]
        public string GamePin { get; set; }
    }
}
