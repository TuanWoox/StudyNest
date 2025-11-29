using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Common.Llm
{
    public class LlmQuizGenerator : ILlmQuizGenerator
    {
        private readonly ILlmClient _client;
        private readonly QuizGenerationPipeline _pipe;
        private readonly IUserContext _user;

        public LlmQuizGenerator(ILlmClient client, QuizGenerationPipeline pipe, IUserContext userContext)
        {
            _client = client;
            _pipe = pipe;
            _user = userContext;
        }

        public async Task<Quiz> GenerateAsync(CreateQuizDTO request, string userId = "")
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    userId = _user.UserId;
                }
                var (prompt, images) = _pipe.BuildPrompt(request);
                var raw = await _client.GenerateAsync(prompt, images);

                var quizEntity = _pipe.ParseToQuiz(raw, userId, request.NoteId, request.Difficulty);

                if (quizEntity.Questions == null || quizEntity.Questions.Count == 0)
                    return quizEntity;

                _pipe.NormalizeQuiz(quizEntity, request);
                return quizEntity;
            }
            catch (InvalidOperationException ex)
            {
                StudyNestLogger.Instance.Error("LLM GenerateAsync (business) error: " + ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error("Unexpected error in LLM GenerateAsync: " + ex);
                throw new Exception("An unexpected error occurred while generating quiz.", ex);
            }
        }


    }
}
