
using static StudyNest.Common.Llm.QuizGenerationPipeline;

namespace StudyNest.Common.Llm.Services
{
    public class QuizValidator
    {
        public List<LlmQuestionDto> FilterValidQuestions(string fullNoteContent, List<LlmQuestionDto> questions)
        {
            if (questions == null || !questions.Any()) return new List<LlmQuestionDto>();

            var normalizedNote = NormalizeText(fullNoteContent);
            var validQuestions = new List<LlmQuestionDto>();

            foreach (var q in questions)
            {
                if (string.IsNullOrWhiteSpace(q.SourceText))
                {
                    continue;
                }

                var normalizedSource = NormalizeText(q.SourceText);

                if (normalizedNote.Contains(normalizedSource))
                {
                    validQuestions.Add(q);
                }
            }

            return validQuestions;
        }

        private string NormalizeText(string input)
        {
            if (string.IsNullOrEmpty(input)) return "";
            return System.Text.RegularExpressions.Regex.Replace(input.ToLowerInvariant(), @"\s+", " ").Trim();
        }
    }
}