using AutoMapper;
using StudyNest.Common.Attributes;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.Question
{
    [AutoMap(typeof(DbEntities.Entities.Question), ReverseMap = true, PreserveReferences = true)]
    public class UpdateQuestionDTO : BaseKey
    {
        [TrimmedRequired]
        public string QuizId { get; set; } = string.Empty;
        [TrimmedRequired]
        public string Name { get; set; } = string.Empty;
        [TrimmedRequired]
        public string Type { get; set; } = string.Empty;  // mcq/msq/tf
        public string Explanation { get; set; } = string.Empty;
        public List<DbEntities.Entities.Choice> Choices { get; set; } = new List<DbEntities.Entities.Choice>();
    }
}
