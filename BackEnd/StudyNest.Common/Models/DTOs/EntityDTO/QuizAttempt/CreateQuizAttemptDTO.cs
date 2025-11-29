using AutoMapper;
using StudyNest.Common.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Models.DTOs.EntityDTO.QuizAttempt
{
    public class CreateQuizAttemptDTO
    {
        [TrimmedRequired]
        public string QuizAttemptSnapshotId { get; set; }
    }
}
