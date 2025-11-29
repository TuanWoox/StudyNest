using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Quizzes
{
    public class UpdateQuizDTO : BaseKey
    {
        public string Title { get; set; } = string.Empty;
        public List<QuestionUpsertDTO> Questions { get; set; } = new ();
    }
    public class QuestionUpsertDTO
    {
        public string? Id { get; set; }
        [TrimmedRequired] public string Name { get; set; } = string.Empty;
        [TrimmedRequired] public string Type { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public List<ChoiceDTO> Choices { get; set; } = new();
    }
}
