using AutoMapper;
using Microsoft.EntityFrameworkCore;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;

namespace StudyNest.Business.v1
{
    class QuestionBusiness : IQuestionBusiness
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserContext _userContext;
        private readonly IMapper _mapper;
        private readonly int MaxQuestions = 20;

        public QuestionBusiness(ApplicationDbContext context, IUserContext userContext, IMapper mapper)
        {
            this._context = context;
            this._userContext = userContext;
            this._mapper = mapper;
        }
        public async Task<ReturnResult<bool>> CreateQuestion(CreateQuestionDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var existingQuiz = await _context.Quizzes
                    .Where(q => q.Id == request.QuizId && q.OwnerId == _userContext.UserId)
                    .FirstOrDefaultAsync();

                if (existingQuiz == null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "Quiz", request.QuizId);
                    return rs;
                }
                var choices = new List<Choice>();
                foreach(var c in request.Choices)
                {
                    choices.Add(new Choice()
                    {
                        Text = c.Text,
                        IsCorrect = c.IsCorrect
                    });
                }
                var errors = ValidateQuestion(request.Name, request.Type, request.Explanation, choices);
                if (!string.IsNullOrEmpty(errors))
                {
                    rs.Message = errors;
                    return rs;
                }

                var newQuestion = new Question()
                {
                    QuizId = request.QuizId,
                    Name = request.Name,
                    Type = request.Type,
                    Explanation = request.Explanation,
                    Choices = choices
                };

                await _context.Questions.AddAsync(newQuestion);

                rs.Result = await _context.SaveChangesAsync() > 0;
                if (!rs.Result)
                {
                    rs.Message = "Question were not updated. Please try again.";
                }

            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return rs;
        }
        public async Task<ReturnResult<bool>> UpdateQuestion(UpdateQuestionDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var existingQuestion = await _context.Questions
                    .Include(q => q.Quiz)
                    .Include(c => c.Choices)
                    .Where(q => q.Id == request.Id && q.Quiz.OwnerId == _userContext.UserId)
                    .FirstOrDefaultAsync();

                if (existingQuestion == null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "Question", request.Id);
                    return rs;
                }

                var errors = ValidateQuestion(request.Name, request.Type, request.Explanation,  request.Choices, true, request.Id);
                if (!string.IsNullOrEmpty(errors))
                {
                    rs.Message = errors;
                    return rs;
                }

                existingQuestion.Name = request.Name;
                existingQuestion.Type = request.Type;
                existingQuestion.Explanation = request.Explanation;

                var incomingChoices = request.Choices ?? new List<Choice>();

                // a) Remove choices không còn trong incoming
                var incomingChoiceIds = new HashSet<string>(
                    incomingChoices.Where(c => !string.IsNullOrWhiteSpace(c.Id)).Select(c => c.Id!),
                    StringComparer.OrdinalIgnoreCase
                );

                var toRemoveChoices = existingQuestion.Choices
                    .Where(c => !incomingChoiceIds.Contains(c.Id))
                    .ToList();
                _context.Choices.RemoveRange(toRemoveChoices);

                foreach (var cDto in incomingChoices)
                {
                    if (string.IsNullOrWhiteSpace(cDto.Id))
                    {
                        // Add
                        existingQuestion.Choices.Add(new Choice
                        {
                            QuestionId = existingQuestion.Id,
                            Text = cDto.Text,
                            IsCorrect = cDto.IsCorrect
                        });
                    }
                    else
                    {
                        // Update
                        var cEntity = existingQuestion.Choices.FirstOrDefault(c => c.Id == cDto.Id);
                        if (cEntity is null) continue;
                        cEntity.Text = cDto.Text;
                        cEntity.IsCorrect = cDto.IsCorrect;
                    }
                }

                rs.Result = await _context.SaveChangesAsync() > 0;
                if (!rs.Result)
                {
                    rs.Message = "Question were not updated. Please try again.";
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }

            return rs;
        }
        public async Task<ReturnResult<bool>> DeleteQuestion(string id)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    rs.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "question id");
                    return rs;
                }
                var questionToDelete = await _context.Questions.Where(x => x.Id == id).ToListAsync();
                if (questionToDelete.Count == 0)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "question", id);
                    return rs;
                }
                _context.RemoveRange(questionToDelete);

                rs.Result = await _context.SaveChangesAsync() > 0;

                if (!rs.Result)
                    rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return rs;
        }


        public static string ValidateQuestion(string name, string type, string explanation, List<Choice> choices, bool isUpdate = false, string? questionId = null)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 300)
                return "Question title is required and must not exceed 300 characters.";

            if (string.IsNullOrWhiteSpace(type))
                return "Question type is missing. Please select MCQ, MSQ, or TF.";

            if (isUpdate && !string.IsNullOrWhiteSpace(questionId))
            {
                if (choices.Any(c => !string.Equals(c.QuestionId, questionId, StringComparison.OrdinalIgnoreCase)))
                    return "One or more choices do not belong to the current question.";
            }

            foreach (var c in choices)
            {
                if (string.IsNullOrWhiteSpace(c.Text))
                    return "Each choice must have text content.";
                else if (c.Text.Trim().Length > 200)
                    return "Choice text must not exceed 200 characters.";
            }

            var dup = choices
                .GroupBy(c => (c.Text ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();
            if (dup.Count > 0)
                return $"Duplicate choice texts found: {string.Join(", ", dup)}.";

            var errors = ValidateChoiceByType(type, choices);
            if (!string.IsNullOrEmpty(errors))
            {
                return errors;
            }

            if (!string.IsNullOrWhiteSpace(explanation) && CountWords(explanation) > 200)
                return "Explanation should be concise (maximum 200 words).";

            return "";
        }
        private static string? ValidateChoiceByType(string? type, List<Choice> choices)
        {
            var t = (type ?? string.Empty).Trim().ToUpperInvariant();

            switch (t)
            {
                case "MCQ":
                    return ValidateMcq(choices);

                case "MSQ":
                    return ValidateMsq(choices);

                case "TF":
                    return ValidateTf(choices);

                default:
                    return "Invalid question type. Supported types: MCQ, MSQ, TF.";
            }
        }

        private static string? ValidateMcq(List<Choice> active)
        {
            var err = EnsureChoiceCount(active, expectedCount: 4, "MCQ must have exactly 4 choices.");
            if (err != null) return err;

            var correct = active.Count(c => c.IsCorrect);
            if (correct != 1) return "MCQ must have exactly 1 correct answer.";
            return null;
        }

        private static string? ValidateMsq(List<Choice> active)
        {
            var err = EnsureChoiceCount(active, expectedCount: 4, "MSQ must have exactly 4 choices.");
            if (err != null) return err;

            var correct = active.Count(c => c.IsCorrect);
            if (correct < 2) return "MSQ must have at least 2 correct answers.";
            return null;
        }

        private static string? ValidateTf(List<Choice> active)
        {
            var err = EnsureChoiceCount(active, expectedCount: 2, "TF question must have exactly 2 choices: True and False.");
            if (err != null) return err;

            bool hasTrue = active.Any(c => string.Equals(c.Text?.Trim(), "True", StringComparison.OrdinalIgnoreCase));
            bool hasFalse = active.Any(c => string.Equals(c.Text?.Trim(), "False", StringComparison.OrdinalIgnoreCase));
            if (!hasTrue || !hasFalse)
                return "TF question must contain only 'True' and 'False' as choices.";

            var correct = active.Count(c => c.IsCorrect);
            if (correct != 1) return "TF question must have exactly 1 correct answer.";
            return null;
        }

        private static string? EnsureChoiceCount(List<Choice> active, int expectedCount, string message)
        {
            return active.Count == expectedCount ? null : message;
        }

        private static int CountWords(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return 0;
            var parts = s.Trim().Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            return parts.Length;
        }
    }
}
