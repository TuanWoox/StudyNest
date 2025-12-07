using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Interfaces
{
    public interface IQuizAttemptSnapshotBusiness
    {
        public Task<ReturnResult<QuizAttemptSnapshotDTO>> GetOneByIdForAttempting(string quizId, bool? keepIsCorrect = false);
        public Task<ReturnResult<QuizAttemptSnapshot>> CreateSnapShot(string quizId);
        public Task<ReturnResult<bool>> CompareQuizSnapShotContentForCreatingNewOne(QuizAttemptSnapshot existingSnapshot, string quizId);
    }
}
