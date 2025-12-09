using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Llm.Configurations;
using StudyNest.Common.Llm.Services;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyNest.Common.Llm
{
    public class LlmQuizGenerator : ILlmQuizGenerator
    {
        private readonly ILlmClient _client;
        private readonly QuizGenerationPipeline _pipe;
        private readonly QuizPromptBuilder _promptBuilder;
        private readonly IUserContext _user;

        public LlmQuizGenerator(ILlmClient client, QuizGenerationPipeline pipe, IUserContext userContext, QuizPromptBuilder promptBuilder)
        {
            _client = client;
            _pipe = pipe;
            _user = userContext;
            _promptBuilder = promptBuilder;
        }

        public async Task<Quiz> GenerateAsync(CreateQuizDTO request, string userId = "")
        {
            if (string.IsNullOrEmpty(userId)) userId = _user.UserId;

            var (markdownNote, images) = _pipe.PrepareContent(request.NoteContent);

            var finalQuestions = new List<Question>();
            string generatedTitle = null;
            
            int maxAttempts = 3;
            int attempt = 0;

            int targetMcq = request.Count_Mcq;
            int targetMsq = request.Count_Msq;
            int targetTf = request.Count_Tf;

            while (attempt < maxAttempts)
            {
                attempt++;

                int currentMcq = finalQuestions.Count(q => q.Type == "MCQ");
                int currentMsq = finalQuestions.Count(q => q.Type == "MSQ");
                int currentTf = finalQuestions.Count(q => q.Type == "TF");

                int missingMcq = targetMcq - currentMcq;
                int missingMsq = targetMsq - currentMsq;
                int missingTf = targetTf - currentTf;

                if (missingMcq <= 0 && missingMsq <= 0 && missingTf <= 0) break;

                int askMcq = missingMcq > 0 ? missingMcq + 1 : 0;
                int askMsq = missingMsq > 0 ? missingMsq + 1 : 0;
                int askTf = missingTf > 0 ? missingTf + 1 : 0;

                var prompt = _promptBuilder.BuildGeneratePrompt(
                    markdownNote, request.Language, request.Difficulty,
                    askMcq, askMsq, askTf
                );

                try
                {
                    var raw = await _client.GenerateAsync(prompt, images);
                    var tempQuiz = _pipe.ParseToQuiz(raw, userId, markdownNote, request.NoteId, request.Difficulty);
                    
                    if (string.IsNullOrEmpty(generatedTitle) && !string.IsNullOrWhiteSpace(tempQuiz.Title))
                    {
                        generatedTitle = tempQuiz.Title;
                    }
                    
                    if (tempQuiz.Questions != null)
                    {
                        foreach (var newQ in tempQuiz.Questions)
                        {
                            if (finalQuestions.Any(exist => exist.Name.Trim().Equals(newQ.Name.Trim(), StringComparison.OrdinalIgnoreCase))) continue;
                            if (newQ.Choices == null || newQ.Choices.Count < 2) continue;
                            if (!newQ.Choices.Any(c => c.IsCorrect)) continue;

                            finalQuestions.Add(newQ);
                        }
                    }
                }
                catch (InvalidOperationException ex)
                {
                    StudyNestLogger.Instance.Error("LLM GenerateAsync (business) error: " + ex.Message);
                    throw;
                }
                catch (Exception ex) {
                    StudyNestLogger.Instance.Error("Unexpected error in LLM GenerateAsync: " + ex);
                    throw new Exception("An unexpected error occurred while generating quiz.", ex);
                }

                if (attempt == 1 && finalQuestions.Count == 0) break;
            }

            var finalTitle = !string.IsNullOrWhiteSpace(generatedTitle) ? generatedTitle : "Generated Quiz";

            var finalQuiz = new Quiz
            {
                Title = finalTitle,
                OwnerId = userId,
                NoteId = request.NoteId,
                Difficulty = request.Difficulty,
                Questions = finalQuestions
            };

            _pipe.NormalizeQuiz(finalQuiz, request);

            return finalQuiz;
        }
    }
}