using AutoMapper;
using StudyNest.Common.DbEntities.BaseEntity;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptAnswer;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt
{
    [AutoMap(typeof(DbEntities.Entities.QuizAttempt), ReverseMap = true, PreserveReferences = true)]
    public class QuizAttemptDTO: BaseEntity<string>
    {
        [Required]
        public string UserId { get; set; }
        public ApplicationUserDTO User { get; set; }
        [Required]
        public string QuizAttemptSnapshotId { get; set; }
        public QuizAttemptSnapshotDTO QuizAttemptSnapshot { get; set; }
        public int Score { get; set; }
        public bool IsCompleted { get; set; }
        public List<QuizAttemptAnswerDTO> QuizAttemptAnswers { get; set; } = new List<QuizAttemptAnswerDTO>();
    }
    [AutoMap(typeof(ApplicationUser), ReverseMap = true, PreserveReferences = true)]
    public class ApplicationUserDTO
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
    }
}
