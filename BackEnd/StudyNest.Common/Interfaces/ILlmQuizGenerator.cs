using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface ILlmQuizGenerator
    {
        Task<Quiz> GenerateAsync(CreateQuizDTO request, string userId = "");

    }
}
