using AutoMapper;
using Hangfire;
using Hangfire.Server;
using Hangfire.Storage;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Hubs;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Llm;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Choice;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Models.Paging;
using StudyNest.Common.Utils.Enums;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace StudyNest.Business.v1
{
    public class QuizBusiness : IQuizBusiness
    {
        const int MAX_LENGTH = 20000;
        private readonly ILlmQuizGenerator _llm;
        private readonly ApplicationDbContext _context;
        private readonly IUserContext _userContext;
        private readonly IRepository<Quiz, string> _repository;
        private readonly IMapper _mapper;
        private readonly int MaxQuestions = 20;
        private readonly IHubContext<QuizCreateHub, IQuizCreateHub> _hubContext;
        public QuizBusiness(
            ILlmQuizGenerator llm,
            ApplicationDbContext context,
            IUserContext userContext,
            IRepository<Quiz, string> repository,
            IMapper mapper,
            IHubContext<QuizCreateHub,
            IQuizCreateHub> hubContext)
        {
            this._llm = llm;
            this._context = context;
            this._userContext = userContext;
            this._repository = repository;
            this._mapper = mapper;
            this._hubContext = hubContext;
        }
        public async Task<ReturnResult<CreateQuizJobResponseDTO>> EnqueueGenerateAsync(CreateQuizDTO dto)
        {
            var result = new ReturnResult<CreateQuizJobResponseDTO>();
            var total = (dto?.Count_Mcq ?? 0) + (dto?.Count_Tf ?? 0) + (dto?.Count_Msq ?? 0);

            if (dto is null)
            {
                result.Message = "The request data is missing or invalid.";
                return result;
            }
            if ((dto.Count_Mcq < 0) || (dto.Count_Tf < 0) || (dto.Count_Msq < 0))
            {
                result.Message = "Each question type count must be a non-negative number.";
                return result;
            }
            if (total <= 0)
            {
                result.Message = "Please specify at least one question to generate.";
                return result;
            }
            if (total > MaxQuestions)
            {
                result.Message = $"You can only generate up to {MaxQuestions} questions at a time.";
                return result;
            }

            try
            {
                var note = await _context.Notes
                    .FirstOrDefaultAsync(n => n.Id == dto.NoteId && n.OwnerId == _userContext.UserId);

                if (note is null)
                {
                    result.Message = "The selected note could not be found. Please check and try again.";
                    return result;
                }

                // Pass note content to generator
                dto.NoteContent = note.Content;

                var timestamp = DateTimeOffset.UtcNow;
                var quizJob = new QuizJob
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = _userContext.UserId,
                    NoteId = dto.NoteId.ToString(),
                    NoteTitle = note.Title,
                    Status = QuizJobStatus.Queued,
                    DateCreated = timestamp,
                    DateModified = timestamp
                };
                _context.QuizJobs.Add(quizJob);
                await _context.SaveChangesAsync();

                var hangfireJobId = BackgroundJob.Enqueue<IQuizBusiness>(x =>
                    x.GenerateQuizInBackground(quizJob.Id, dto, _userContext.UserId));

                quizJob.HangfireJobId = hangfireJobId;
                await _context.SaveChangesAsync();

                await _hubContext.Clients.User(_userContext.UserId)
                    .CreateStarted(quizJob.Id, note.Title, timestamp, "queued");

                result.Result = new CreateQuizJobResponseDTO
                {
                    JobId = quizJob.Id,
                    NoteTitle = note.Title,
                    Timestamp = timestamp
                };
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task GenerateQuizInBackground(string jobId, CreateQuizDTO dto, string userId)
        {
            await GenerateQuizInBackground(jobId, dto, userId, null);
        }
        public async Task GenerateQuizInBackground(string quizJobId, CreateQuizDTO dto, string userId, PerformContext context = null)
        {
            try
            {
                var jobEntity = await _context.QuizJobs.FindAsync(quizJobId);
                if (jobEntity == null) return;

                jobEntity.Status = QuizJobStatus.Processing;
                jobEntity.DateModified = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();

                // Notify frontend that job is now processing
                await _hubContext.Clients.User(userId).CreateStarted(
                    quizJobId, jobEntity.NoteTitle, jobEntity.DateModified.Value, "processing");

                var newQuiz = await _llm.GenerateAsync(dto, userId);

                if (newQuiz is null || newQuiz.Questions is null || newQuiz.Questions.Count == 0)
                {
                    await HandleJobFailure(jobEntity, "Note is insufficient or meaningless.", userId);
                    return;
                }

                newQuiz.Difficulty = dto.Difficulty.ToLower().Trim();
                newQuiz.IsBeingConvertToSnapShot = true;
                newQuiz.NoteId = dto.NoteId.ToString();

                await _context.AddAsync(newQuiz);
                await _context.SaveChangesAsync();

                jobEntity.Status = QuizJobStatus.Success;
                jobEntity.ResultQuizId = newQuiz.Id;
                jobEntity.DateModified = DateTimeOffset.UtcNow;
                _context.Update(jobEntity);
                await _context.SaveChangesAsync();

                BackgroundJob.Enqueue<IQuizAttemptSnapshotBusiness>(x =>
                    x.CreateSnapShot(newQuiz.Id.Trim()));

                await _hubContext.Clients.User(userId).CreateFinished(
                    quizJobId, true, newQuiz.Id, null);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error($"Quiz generation failed for QuizJobId {quizJobId}: {ex}");

                var jobEntity = await _context.QuizJobs.FindAsync(quizJobId);
                if (jobEntity != null)
                {
                    await HandleJobFailure(jobEntity, "An unexpected error occurred.", userId);
                }
            }
        }
        private async Task HandleJobFailure(QuizJob job, string message, string userId)
        {
            job.Status = QuizJobStatus.Failed;
            job.ErrorMessage = message;
            job.DateModified = DateTimeOffset.UtcNow;
            _context.Update(job);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.User(userId).CreateFinished(
                job.Id, false, null, message);
        }
        public async Task<ReturnResult<string>> CreateQuizFromScratch(CreateManualQuizDTO request)
        {
            var rs = new ReturnResult<string>();
            try
            {
                if (request.Questions is null || request.Questions.Count == 0)
                {
                    rs.Message = "Quiz cannot have empty questions.";
                    return rs;
                }

                var newQuiz = new Quiz
                {
                    Title = request.Title.Trim(),
                    Difficulty = request.Difficulty.Trim(),
                    OwnerId = _userContext.UserId,
                    NoteId = null
                };

                foreach (var qDto in request.Questions)
                {
                    var choicesForValidate = (qDto.Choices ?? new())
                        .Select(c => new Choice { Text = c.Text, IsCorrect = c.IsCorrect })
                        .ToList();

                    var validationError = QuestionBusiness.ValidateQuestion(
                        qDto.Name, qDto.Type, qDto.Explanation ?? string.Empty, choicesForValidate);

                    if (!string.IsNullOrEmpty(validationError))
                    {
                        rs.Message = validationError;
                        return rs;
                    }

                    var newQuestion = new Question
                    {
                        Name = qDto.Name.Trim(),
                        Type = qDto.Type.Trim().ToUpperInvariant(),
                        Explanation = qDto.Explanation?.Trim() ?? string.Empty,
                        Choices = (qDto.Choices ?? new())
                            .Select(c => new Choice
                            {
                                Text = c.Text.Trim(),
                                IsCorrect = c.IsCorrect
                            })
                            .ToList()
                    };
                    newQuiz.Questions.Add(newQuestion);
                }

                _context.Quizzes.Add(newQuiz);
                await _context.SaveChangesAsync();

                rs.Result = newQuiz.Id;
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }
        public async Task<ReturnResult<PagedData<QuizListDTO, string>>> GetAllQuizByUserId(Page<string> page, bool isExported = false)
        {
            var rs = new ReturnResult<PagedData<QuizListDTO, string>>();
            try
            {
                var query = _context.Quizzes
                    .Where(n => n.OwnerId == _userContext.UserId)
                    .Include(x => x.Questions)
                    .Include(n => n.Note)
                    .AsNoTracking()
                    .OrderByDescending(q => q.DateModified ?? DateTimeOffset.MinValue)
                    .AsQueryable();
                rs.Result = await _repository.GetPagingAsync<Page<string>, QuizListDTO>(query, page, isExported);
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }
        public async Task<ReturnResult<Quiz>> GetQuizDetail(string id)
        {
            var rs = new ReturnResult<Quiz>();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    rs.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "quiz id");
                    return rs;
                }
                var quiz = await _context.Quizzes
                    .Where(q => q.Id == id && q.OwnerId == _userContext.UserId)
                    .Include(q => q.Questions)
                        .ThenInclude(qn => qn.Choices)
                    .Include(q => q.QuizStars)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
                if (quiz is null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", id);
                    return rs;
                }
                quiz.Questions = quiz.Questions
                    .OrderByDescending(q => q.DateModified)
                    .ToList();
                rs.Result = quiz;
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }
        public async Task<ReturnResult<bool>> UpdateQuiz(UpdateQuizDTO request)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var existingQuiz = await _context.Quizzes
                    .Include(q => q.Questions)
                        .ThenInclude(x => x.Choices)
                    .FirstOrDefaultAsync(q => q.Id == request.Id && q.OwnerId == _userContext.UserId);

                if (existingQuiz is null)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "Quiz", request.Id);
                    return rs;
                }

                if (request.Questions is null || request.Questions.Count == 0)
                {
                    rs.Message = "Quiz cannot have empty question";
                    return rs;
                }

                existingQuiz.Title = request.Title?.Trim() ?? existingQuiz.Title;
                var incomingQuestions = request.Questions;

                var incomingIds = new HashSet<string>(
                    incomingQuestions.Where(q => !string.IsNullOrWhiteSpace(q.Id)).Select(q => q.Id!),
                    StringComparer.OrdinalIgnoreCase
                );

                var removeQuestions = existingQuiz.Questions
                    .Where(q => !incomingIds.Contains(q.Id))
                    .ToList();
                _context.Questions.RemoveRange(removeQuestions);

                foreach (var qDto in incomingQuestions)
                {
                    var choicesForValidate = (qDto.Choices ?? new List<Common.Models.DTOs.EntityDTO.Question.ChoiceDTO>())
                        .Select(c => new Choice { Text = c.Text, IsCorrect = c.IsCorrect })
                        .ToList();

                    var v = QuestionBusiness.ValidateQuestion(qDto.Name, qDto.Type, qDto.Explanation ?? string.Empty, choicesForValidate);
                    if (!string.IsNullOrEmpty(v)) { rs.Message = v; return rs; }

                    if (string.IsNullOrWhiteSpace(qDto.Id))
                    {
                        // NEW Question
                        var newQ = new Question
                        {
                            QuizId = existingQuiz.Id,
                            Name = qDto.Name,
                            Type = qDto.Type,
                            Explanation = qDto.Explanation ?? string.Empty,
                            Choices = (qDto.Choices ?? new())
                                .Select(c => new Choice
                                {
                                    Text = c.Text,
                                    IsCorrect = c.IsCorrect
                                })
                                .ToList()
                        };
                        existingQuiz.Questions.Add(newQ);
                    }
                    else
                    {
                        var qEntity = existingQuiz.Questions.FirstOrDefault(x => x.Id == qDto.Id);
                        if (qEntity is null) continue;

                        if (!string.Equals(qEntity.QuizId, existingQuiz.Id, StringComparison.OrdinalIgnoreCase))
                        {
                            rs.Message = "Question does not belong to this quiz.";
                            return rs;
                        }

                        qEntity.Name = qDto.Name;
                        qEntity.Type = qDto.Type;
                        qEntity.Explanation = qDto.Explanation ?? string.Empty;

                        var incomingChoices = qDto.Choices;

                        var incomingChoiceIds = new HashSet<string>(
                            incomingChoices.Where(c => !string.IsNullOrWhiteSpace(c.Id)).Select(c => c.Id!),
                            StringComparer.OrdinalIgnoreCase
                        );

                        var toRemoveChoices = qEntity.Choices
                            .Where(c => !incomingChoiceIds.Contains(c.Id))
                            .ToList();
                        _context.Choices.RemoveRange(toRemoveChoices);

                        foreach (var cDto in incomingChoices)
                        {
                            if (string.IsNullOrWhiteSpace(cDto.Id))
                            {
                                qEntity.Choices.Add(new Choice
                                {
                                    QuestionId = qEntity.Id,
                                    Text = cDto.Text,
                                    IsCorrect = cDto.IsCorrect
                                });
                            }
                            else
                            {
                                var cEntity = qEntity.Choices.FirstOrDefault(c => c.Id == cDto.Id);
                                if (cEntity is null) continue;
                                cEntity.Text = cDto.Text;
                                cEntity.IsCorrect = cDto.IsCorrect;
                            }
                        }
                    }
                }

                rs.Result = await _context.SaveChangesAsync() > 0;
                if (!rs.Result)
                {
                    rs.Message = "Quiz was not updated. Please try again.";
                }
            }
            catch (Exception ex)
            {
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return rs;
        }
        public async Task<ReturnResult<bool>> DeleteById(string id)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    rs.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "quiz id");
                    return rs;
                }
                var quizToDelete = await _context.Quizzes.Where(x => x.Id == id).ToListAsync();
                if (quizToDelete.Count == 0)
                {
                    rs.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", id);
                    return rs;
                }
                _context.RemoveRange(quizToDelete);

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
        public async Task<ReturnResult<bool>> ValidateNoteContent(string noteId)
        {
            var rs = new ReturnResult<bool>();
            try
            {
                var note = await _context.Notes
                    .FirstOrDefaultAsync(n => n.Id == noteId && n.OwnerId == _userContext.UserId);

                if (note is null)
                {
                    rs.Message = "The selected note could not be found. Please check and try again.";
                    return rs;
                }
                var (markdown, _) = QuizGenerationPipeline.FlattenEditorJsNote(note.Content, true);
                rs.Result = markdown.Length <= MAX_LENGTH;
                if (!rs.Result)
                {
                    rs.Message = "The note content is reach 20.000 characters, Please choose another note!";
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);
                rs.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
            }
            return rs;
        }
        public async Task<ReturnResult<bool>> PublishQuiz(string quizId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            result.Result = false;
            try
            {
                var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && q.OwnerId == _userContext.UserId);
                if (quiz != null)
                {
                    if (quiz.IsPublic)
                    {
                        quiz.IsPublic = false;
                        if (await _context.SaveChangesAsync() > 0)
                        {
                            result.Result = true;
                        }
                    }
                    else
                    {
                        quiz.IsPublic = true;

                        // Generate a unique friendly URL
                        string newFriendlyUrl;
                        bool isUnique;
                        do
                        {
                            newFriendlyUrl = Guid.NewGuid().ToString().Replace("-", "");
                            isUnique = !await _context.Quizzes.AnyAsync(q => q.FriendlyURL == newFriendlyUrl);
                        } while (!isUnique);

                        quiz.FriendlyURL = newFriendlyUrl;

                        if (await _context.SaveChangesAsync() > 0)
                        {
                            result.Result = true;
                        }
                    }
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                }
                if (!result.Result && result.Message == null)
                {
                    result.Message = "Fail to publish quiz, please try again";
                }
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<Quiz>> ForkQuiz(string quizId)
        {
            var result = new ReturnResult<Quiz>();
            try
            {
                var existingQuiz = await _context.Quizzes
                    .Include(q => q.Questions)
                        .ThenInclude(qn => qn.Choices)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(q => q.Id == quizId && q.IsPublic);

                if (existingQuiz == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                    return result;
                }

                if (_userContext.UserId == existingQuiz.OwnerId)
                {
                    result.Message = "You cannot fork your own quiz.";
                    return result;
                }

                // Create a new quiz with forked content
                var forkedQuiz = new Quiz
                {
                    Title = $"{existingQuiz.Title} (Forked)",
                    Difficulty = existingQuiz.Difficulty,
                    OwnerId = _userContext.UserId,
                    NoteId = null,
                    IsPublic = false,
                    FriendlyURL = string.Empty,
                    IsBeingConvertToSnapShot = false,
                    Questions = existingQuiz.Questions.Select(q => new Question
                    {
                        Name = q.Name,
                        Type = q.Type,
                        Explanation = q.Explanation,
                        Choices = q.Choices.Select(c => new Choice
                        {
                            Text = c.Text,
                            IsCorrect = c.IsCorrect
                        }).ToList()
                    }).ToList()
                };
                _context.Quizzes.Add(forkedQuiz);

                if (await _context.SaveChangesAsync() > 0)
                {
                    result.Result = forkedQuiz;
                }
                else
                {
                    result.Message = "Failed to fork quiz. Please try again.";
                }
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<QuizDTO>> GetQuizDetailByFriendlyURL(string friendlyURL)
        {
            ReturnResult<QuizDTO> result = new ReturnResult<QuizDTO>();
            try
            {
                if (string.IsNullOrWhiteSpace(friendlyURL))
                {
                    result.Message = ResponseMessage.MESSAGE_ITEM_NOT_EXIST.Replace("{0}", "quiz url");
                    return result;
                }
                var quiz = await _context.Quizzes
                    .Where(q => q.FriendlyURL == friendlyURL)
                    .Include(q => q.Questions)
                        .ThenInclude(qn => qn.Choices)
                    .Include(q => q.Owner)
                    .Include(q => q.QuizStars)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
                if (quiz == null || !quiz.IsPublic)
                {
                    return result;
                }
                quiz.Questions = quiz.Questions
                    .OrderByDescending(q => q.DateModified)
                    .ToList();

                result.Result = _mapper.Map<QuizDTO>(quiz);
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> ChangeFriendlyUrl(string id, string newFriendlyUrl)
        {
            var result = new ReturnResult<bool>();

            try
            {
                // ===== VALIDATION =====
                if (string.IsNullOrWhiteSpace(newFriendlyUrl))
                {
                    result.Message = "Friendly URL cannot be empty";
                    return result;
                }

                newFriendlyUrl = newFriendlyUrl.Trim();

                if (newFriendlyUrl.Length < 3)
                {
                    result.Message = "Friendly URL must be at least 3 characters";
                    return result;
                }

                if (newFriendlyUrl.Length > 100)
                {
                    result.Message = "Friendly URL must be less than 100 characters";
                    return result;
                }

                if (!Regex.IsMatch(newFriendlyUrl, "^[a-zA-Z0-9_-]+$"))
                {
                    result.Message = "Friendly URL can only contain letters, numbers, hyphens, and underscores";
                    return result;
                }

                // ===== FETCH QUIZ =====
                var existingQuiz = await _context.Quizzes
                    .FirstOrDefaultAsync(x => x.Id == id.Trim() && x.OwnerId == _userContext.UserId);

                if (existingQuiz == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", id);
                    return result;
                }

                // ===== CHECK URL ALREADY USED (excluding current quiz) =====
                bool friendlyUrlTaken = await _context.Quizzes
                    .AnyAsync(x => x.FriendlyURL == newFriendlyUrl && x.Id != id);

                if (friendlyUrlTaken)
                {
                    result.Message = "This friendly URL has already been used. Please choose another.";
                    return result;
                }

                // ===== APPLY CHANGE =====
                existingQuiz.FriendlyURL = newFriendlyUrl;

                int saveResult = await _context.SaveChangesAsync();

                if (saveResult > 0)
                {
                    result.Result = true;
                }
                else
                {
                    result.Message = "Failed to update the friendly URL. Please try again later.";
                }
            }
            catch (Exception ex)
            {
                result.Message = "An unexpected error occurred.";
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
        public async Task<ReturnResult<PagedData<QuizDTO, string>>> ExplorePublicQuizzes(Page<string> page)
        {
            ReturnResult<PagedData<QuizDTO, string>> result = new ReturnResult<PagedData<QuizDTO, string>>();
            try
            {
                var query = _context.Quizzes.Where(n => n.IsPublic == true && n.OwnerId != _userContext.UserId)
                                            .Include(n => n.Owner)
                                            .Include(n => n.Questions)
                                            .ThenInclude(n => n.Choices)
                                            .Include(n => n.QuizStars)
                                            .AsNoTracking()
                                            .OrderByDescending(q => q.DateModified ?? DateTimeOffset.MinValue)
                                            .AsQueryable();
                result.Result = await _repository.GetPagingAsync<Page<string>, QuizDTO>(query, page, false);
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<bool>> StarQuiz(string quizId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();
            result.Result = false;
            try
            {
                var existingQuiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && q.IsPublic);
                if (existingQuiz == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                    return result;
                }
                else
                { 
                    var existingStar = await _context.QuizStars.FirstOrDefaultAsync(qs => qs.QuizId == quizId && qs.UserId == _userContext.UserId);
                    if (existingStar == null) { 
                        var newStar = new QuizStar
                        {
                            QuizId = quizId,
                            UserId = _userContext.UserId,
                        };
                        var addStar = await _context.QuizStars.AddAsync(newStar);
                        if(await _context.SaveChangesAsync() > 0)
                        {
                            result.Result = true;
                        } 
                    } 
                    else
                    {
                        existingStar.Deleted = !existingStar.Deleted;
                        _context.Update(existingStar);
                        if (await _context.SaveChangesAsync() > 0)
                        {
                            result.Result = true;
                        }
                    }
                }
                if(result.Result == false)
                {
                    result.Message = "Fail to star quiz, please try again";
                }
            }
            catch (Exception ex)
            {
                result.Message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
    }
}
