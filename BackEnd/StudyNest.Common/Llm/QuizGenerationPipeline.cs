using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Llm.Services;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace StudyNest.Common.Llm
{
    public class QuizGenerationPipeline
    {
        private readonly QuizValidator quizValidator = new QuizValidator();
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };
        public (string Markdown, List<string> Images) PrepareContent(string noteJson)
        {
            return FlattenEditorJsNote(noteJson);
        }

        public Quiz ParseToQuiz(string llmText, string createdBy, string fullNoteContent, string? noteId = null, string difficulty = "Medium")
        {
            if (string.IsNullOrWhiteSpace(createdBy))
                throw new ArgumentException("createdBy is required", nameof(createdBy));

            var json = ExtractJson(llmText);
            json = NormalizeBooleanLiterals(json); 

            LlmQuizDto dto;
            
            using (var probe = JsonDocument.Parse(json))
            {
                if (probe.RootElement.TryGetProperty("eligible", out var elig) &&
                    elig.ValueKind == JsonValueKind.False)
                {
                    var reason = probe.RootElement.TryGetProperty("reason", out var r) ? r.GetString() : "Ineligible note.";
                    return new Quiz();    
                }

                if (probe.RootElement.TryGetProperty("quiz", out var quizProp))
                {
                    var nestedJson = quizProp.GetRawText();
                    dto = JsonSerializer.Deserialize<LlmQuizDto>(nestedJson, JsonOpts)
                          ?? throw new InvalidOperationException("Cannot deserialize nested quiz JSON.");
                }
                else
                {
                    dto = JsonSerializer.Deserialize<LlmQuizDto>(json, JsonOpts)
                          ?? throw new InvalidOperationException("Cannot deserialize quiz JSON.");
                }
            }

            var normalizedDifficulty = (difficulty ?? "").Trim().ToLower();

            if (normalizedDifficulty != "easy" &&
                normalizedDifficulty != "medium" &&
                normalizedDifficulty != "hard")
            {
                normalizedDifficulty = "medium";
            }

            var quiz = new Quiz
            {
                Title = string.IsNullOrWhiteSpace(dto.Title) ? "Generated Quiz" : dto.Title.Trim(),
                OwnerId = createdBy,
                NoteId = noteId,
                Difficulty = normalizedDifficulty,
                Questions = new List<Question>()
            };
            dto.Questions = quizValidator.FilterValidQuestions(fullNoteContent, dto.Questions);
            foreach (var q in dto.Questions ?? new List<LlmQuestionDto>())
            {
                var type = (q.Type ?? "").Trim().ToUpperInvariant();
                if (type != "MCQ" && type != "MSQ" && type != "TF")
                    type = "MCQ";

                var question = new Question
                {
                    Name = string.IsNullOrWhiteSpace(q.Name) ? "Untitled question" : q.Name.Trim(),
                    Type = type,
                    Explanation = (q.Explanation ?? string.Empty).Trim(),
                    Choices = new List<Choice>()
                };

                var choicesList = q.Choices ?? new List<LlmChoiceDto>();
                
                if (type == "MCQ" || type == "MSQ")
                {
                    var validChoices = choicesList
                        .Where(c => !string.IsNullOrWhiteSpace(c.Text))
                        .Take(4)
                        .ToList();

                    while (validChoices.Count < 4)
                    {
                        validChoices.Add(new LlmChoiceDto 
                        { 
                            Text = $"Option {validChoices.Count + 1}",
                            IsCorrect = false
                        });
                    }

                    if (type == "MCQ")
                    {
                        var correctCount = validChoices.Count(c => c.IsCorrect);
                        if (correctCount != 1)
                        {
                            foreach (var c in validChoices) c.IsCorrect = false;
                            validChoices[0].IsCorrect = true;
                        }
                    }

                    foreach (var c in validChoices)
                    {
                        question.Choices.Add(new Choice
                        {
                            Text = c.Text?.Trim() ?? "",
                            IsCorrect = c.IsCorrect
                        });
                    }
                }
                else 
                {
                    bool correctIsTrue = true;
                    if (choicesList.Count >= 2)
                    {
                        var trueChoice = choicesList.FirstOrDefault(c => 
                            c.Text?.Trim().Equals("True", StringComparison.OrdinalIgnoreCase) ?? false);
                        correctIsTrue = trueChoice?.IsCorrect ?? true;
                    }

                    question.Choices.Add(new Choice { Text = "True", IsCorrect = correctIsTrue });
                    question.Choices.Add(new Choice { Text = "False", IsCorrect = !correctIsTrue });
                }

                quiz.Questions.Add(question);
            }

            return quiz;
        }


        public void NormalizeQuiz(Quiz quiz, CreateQuizDTO req)
        {
            if (quiz == null) throw new ArgumentNullException(nameof(quiz));

            var mcqTarget = req.Count_Mcq;
            var msqTarget = req.Count_Msq;
            var tfTarget = req.Count_Tf;

            var mcqs = quiz.Questions.Where(q => q.Type == "MCQ").Take(mcqTarget);
            var msqs = quiz.Questions.Where(q => q.Type == "MSQ").Take(msqTarget);
            var tfs = quiz.Questions.Where(q => q.Type == "TF").Take(tfTarget);

            var merged = mcqs.Concat(msqs).Concat(tfs).ToList();

            quiz.Questions = merged;
        }


        // ---------- helpers ----------

        private static string ExtractJson(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return "{}";
            var m = Regex.Match(s, "```(?:json)?\\s*([\\s\\S]*?)```", RegexOptions.IgnoreCase);
            if (m.Success) return m.Groups[1].Value.Trim();

            var i = s.IndexOf('{'); var j = s.LastIndexOf('}');
            return (i >= 0 && j > i) ? s.Substring(i, j - i + 1).Trim() : s.Trim();
        }

        public static (string markdown, List<string> imageUrls) FlattenEditorJsNote(string noteJson, bool compact = false)
        {
            if (string.IsNullOrWhiteSpace(noteJson))
                return ("", new());

            var trimmed = noteJson.Trim();
            if (trimmed.Length == 0 || (trimmed[0] != '{' && trimmed[0] != '['))
                return (trimmed, new());

            try
            {
                using var doc = JsonDocument.Parse(trimmed);
                if (!doc.RootElement.TryGetProperty("blocks", out var blocks) ||
                    blocks.ValueKind != JsonValueKind.Array)
                {
                    return (trimmed, new());
                }

                var sb = new StringBuilder();
                var images = new List<string>();

                string blockSeparator = compact ? "\n" : "\n\n";

                foreach (var block in blocks.EnumerateArray())
                {
                    var type = block.GetProperty("type").GetString() ?? "";
                    var data = block.GetProperty("data");

                    switch (type.ToLowerInvariant())
                    {
                        case "header":
                            {
                                var level = data.TryGetProperty("level", out var lvl) ? Math.Clamp(lvl.GetInt32(), 1, 6) : 2;
                                var content = CleanInlineHtml(data.GetProperty("text").GetString() ?? "");

                                if (compact)
                                    sb.Append($"H{level}: {content}{blockSeparator}");
                                else
                                    sb.Append($"{new string('#', level)} {content}{blockSeparator}");
                                break;
                            }

                        case "paragraph":
                            {
                                var content = CleanInlineHtml(data.GetProperty("text").GetString() ?? "");
                                if (!string.IsNullOrWhiteSpace(content))
                                    sb.Append($"{content}{blockSeparator}");
                                break;
                            }

                        case "quote":
                            {
                                var content = CleanInlineHtml(data.GetProperty("text").GetString() ?? "");
                                var caption = data.TryGetProperty("caption", out var c) ? CleanInlineHtml(c.GetString() ?? "") : "";

                                if (!string.IsNullOrWhiteSpace(content))
                                {
                                    if (compact)
                                    {
                                        var fullQuote = string.IsNullOrWhiteSpace(caption)
                                            ? content
                                            : $"{content} — {caption}";
                                        sb.Append($"Quote: {fullQuote}{blockSeparator}");
                                    }
                                    else
                                    {
                                        sb.Append($"> {content}\n");
                                        if (!string.IsNullOrWhiteSpace(caption))
                                            sb.Append($"> — {caption}\n");
                                        sb.Append(blockSeparator);
                                    }
                                }
                                break;
                            }

                        case "warning":
                        case "alert":
                            {
                                var title = data.TryGetProperty("title", out var t) ? CleanInlineHtml(t.GetString() ?? "") : "";
                                var message = data.TryGetProperty("message", out var m) ? CleanInlineHtml(m.GetString() ?? "") : "";

                                if (!string.IsNullOrWhiteSpace(title) || !string.IsNullOrWhiteSpace(message))
                                {
                                    var combined = string.IsNullOrWhiteSpace(title) ? message : $"{title}: {message}";
                                    sb.Append($"{combined}{blockSeparator}");
                                }
                                break;
                            }

                        case "list":
                            {
                                var style = data.TryGetProperty("style", out var s) ? s.GetString() : "unordered";
                                if (data.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
                                {
                                    int i = 1;
                                    foreach (var item in items.EnumerateArray())
                                    {
                                        string itemText;
                                        bool? isChecked = null;

                                        if (item.ValueKind == JsonValueKind.String)
                                        {
                                            itemText = CleanInlineHtml(item.GetString() ?? "");
                                        }
                                        else if (item.ValueKind == JsonValueKind.Object)
                                        {
                                            itemText = item.TryGetProperty("content", out var content)
                                                ? CleanInlineHtml(content.GetString() ?? "")
                                                : "";

                                            if (item.TryGetProperty("meta", out var meta) &&
                                                meta.TryGetProperty("checked", out var checkedProp))
                                            {
                                                isChecked = checkedProp.GetBoolean();
                                            }
                                        }
                                        else
                                        {
                                            continue;
                                        }

                                        if (!string.IsNullOrWhiteSpace(itemText))
                                        {
                                            if (compact)
                                            {
                                                sb.Append($"{itemText}\n");
                                            }
                                            else
                                            {
                                                if (style == "ordered")
                                                    sb.Append($"{i}. {itemText}\n");
                                                else if (style == "checklist")
                                                    sb.Append($"- [{(isChecked == true ? "x" : " ")}] {itemText}\n");
                                                else
                                                    sb.Append($"- {itemText}\n");
                                            }
                                            i++;
                                        }
                                    }
                                    sb.Append(blockSeparator);
                                }
                                break;
                            }

                        case "table":
                            {
                                if (data.TryGetProperty("content", out var content) && content.ValueKind == JsonValueKind.Array)
                                {
                                    if (compact)
                                    {
                                        var allCells = new List<string>();
                                        foreach (var row in content.EnumerateArray())
                                        {
                                            if (row.ValueKind == JsonValueKind.Array)
                                            {
                                                foreach (var cell in row.EnumerateArray())
                                                {
                                                    var cellText = CleanInlineHtml(cell.GetString() ?? "");
                                                    if (!string.IsNullOrWhiteSpace(cellText))
                                                        allCells.Add(cellText);
                                                }
                                            }
                                        }
                                        if (allCells.Any())
                                            sb.Append($"Table: {string.Join(", ", allCells)}{blockSeparator}");
                                    }
                                    else
                                    {
                                        sb.Append("**Table:**\n");
                                        foreach (var row in content.EnumerateArray())
                                        {
                                            if (row.ValueKind == JsonValueKind.Array)
                                            {
                                                var cells = new List<string>();
                                                foreach (var cell in row.EnumerateArray())
                                                {
                                                    cells.Add(CleanInlineHtml(cell.GetString() ?? ""));
                                                }
                                                sb.Append($"| {string.Join(" | ", cells)} |\n");
                                            }
                                        }
                                        sb.Append(blockSeparator);
                                    }
                                }
                                break;
                            }

                        case "code":
                            {
                                var code = data.TryGetProperty("code", out var c) ? c.GetString() ?? "" : "";

                                if (!string.IsNullOrWhiteSpace(code))
                                {
                                    if (compact)
                                    {
                                        var lines = code.Split('\n');
                                        var preview = string.Join(" ", lines);
                                        sb.Append($"Code: {preview}{blockSeparator}");
                                    }
                                    else
                                    {
                                        var language = data.TryGetProperty("language", out var l) ? l.GetString() ?? "" : "";
                                        sb.Append($"```{language}\n{code}\n```{blockSeparator}");
                                    }
                                }
                                break;
                            }

                        case "math":
                            {
                                var math = data.TryGetProperty("math", out var m) ? m.GetString() ?? "" : "";
                                if (!string.IsNullOrWhiteSpace(math))
                                    sb.Append($"Math: {math}{blockSeparator}");
                                break;
                            }

                        case "image":
                            {
                                if (data.TryGetProperty("file", out var file) &&
                                    file.TryGetProperty("url", out var u))
                                {
                                    var url = u.GetString();
                                    if (!string.IsNullOrWhiteSpace(url)) images.Add(url);
                                }

                                if (!compact)
                                {
                                    var caption = data.TryGetProperty("caption", out var c) ? CleanInlineHtml(c.GetString() ?? "") : "";
                                    if (!string.IsNullOrWhiteSpace(caption))
                                        sb.Append($"Image: {caption}{blockSeparator}");
                                }
                                break;
                            }

                        default:
                            if (data.TryGetProperty("text", out var text))
                            {
                                var t = CleanInlineHtml(text.GetString() ?? "");
                                if (!string.IsNullOrWhiteSpace(t))
                                    sb.Append($"{t}{blockSeparator}");
                            }
                            break;
                    }
                }

                return (sb.ToString().Trim(), images);
            }
            catch (JsonException)
            {
                return (trimmed, new());
            }
        }

        private static string CleanInlineHtml(string s)
        {
            if (string.IsNullOrEmpty(s)) return s;
            
            s = Regex.Replace(s, "<script[^>]*?>.*?</script>", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);
            s = Regex.Replace(s, "<style[^>]*?>.*?</style>", "", RegexOptions.IgnoreCase | RegexOptions.Singleline);
            
            s = Regex.Replace(s, "<[^>]+>", string.Empty);
            
            s = s.Replace("&nbsp;", " ")
                 .Replace("&lt;", "<")
                 .Replace("&gt;", ">")
                 .Replace("&amp;", "&")
                 .Replace("&quot;", "\"")
                 .Replace("&#39;", "'")
                 .Replace("&apos;", "'")
                 .Replace("&mdash;", "—")
                 .Replace("&ndash;", "–")
                 .Replace("&hellip;", "…")
                 .Replace("&copy;", "©")
                 .Replace("&reg;", "®")
                 .Replace("&trade;", "™");
            
            s = Regex.Replace(s, @"&#(\d+);", m => 
            {
                if (int.TryParse(m.Groups[1].Value, out int code))
                    return ((char)code).ToString();
                return m.Value;
            });
            
            s = Regex.Replace(s, @"&#x([0-9A-Fa-f]+);", m => 
            {
                if (int.TryParse(m.Groups[1].Value, System.Globalization.NumberStyles.HexNumber, null, out int code))
                    return ((char)code).ToString();
                return m.Value;
            });
            
            s = Regex.Replace(s, @"\s+", " ");
            
            return s.Trim();
        }
        private static string NormalizeBooleanLiterals(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return json;
            return Regex.Replace(json,
                @"(?<=:\s*)(True|False)(?=\s*[,}])",
                m => m.Value.ToLowerInvariant(),
                RegexOptions.CultureInvariant);
        }

        public sealed class LlmQuizDto
        {
            public string? Title { get; set; }
            public List<LlmQuestionDto>? Questions { get; set; }
        }
        public sealed class LlmQuestionDto
        {
            public string? Name { get; set; }
            public string? Type { get; set; }
            public List<LlmChoiceDto>? Choices { get; set; }
            public string? Explanation { get; set; }
            public string? SourceText { get; set; }
        }
        public sealed class LlmChoiceDto
        {
            public string? Text { get; set; }
            public bool IsCorrect { get; set; }
        }
    }
}
