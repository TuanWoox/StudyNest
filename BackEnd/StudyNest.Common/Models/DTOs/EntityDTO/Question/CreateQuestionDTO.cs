using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Question
{
    public class CreateQuestionDTO
    {
        [TrimmedRequired]
        public string QuizId { get; set; } = string.Empty;
        [TrimmedRequired]
        public string Name { get; set; } = string.Empty;
        [TrimmedRequired]
        public string Type { get; set; } = string.Empty;  // mcq/msq/tf
        public string Explanation { get; set; } = string.Empty;
        public List<ChoiceDTO> Choices { get; set; } = new List<ChoiceDTO>();
    }
    [AutoMap(typeof(StudyNest.Common.DbEntities.Entities.Choice), ReverseMap = true)]
    public class ChoiceDTO
    {
        public string? Id { get; set; }
        [TrimmedRequired]
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
