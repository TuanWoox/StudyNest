using AutoMapper;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyNest.Business.Repository;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Choice;
using StudyNest.Common.Models.DTOs.EntityDTO.Question;
using StudyNest.Common.Models.DTOs.EntityDTO.QuizAttemptSnapshot;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Common.Utils.Helper;
using StudyNest.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class QuizAttemptSnapshotBusiness: IQuizAttemptSnapshotBusiness
    {
        ApplicationDbContext _context;
        IRepository<QuizAttemptSnapshot, string> _repository;
        IMapper _mapper;
        IUserContext _userContext;
        IHubContext<Hubs.QuizAttemptSnapshotHub, Hubs.IQuizAttemptSnapshotClient> _snapshotHub;
        public QuizAttemptSnapshotBusiness(ApplicationDbContext context, IRepository<QuizAttemptSnapshot, string> repository, IMapper mapper,
            IUserContext userContext, IHubContext<Hubs.QuizAttemptSnapshotHub, Hubs.IQuizAttemptSnapshotClient> snapshotHub
            ) 
        {
            this._context = context;
            this._repository = repository;
            this._mapper = mapper;
            this._userContext = userContext;
            this._snapshotHub = snapshotHub;
        }
        public async Task<ReturnResult<QuizAttemptSnapshotDTO>> GetOneByIdForAttempting(string quizId)
        {
            ReturnResult<QuizAttemptSnapshotDTO> result = new ReturnResult<QuizAttemptSnapshotDTO>();
            try
            {
                //Find the latest snapshot for the quiz that belongs to the current user and is not being converted to snapshot
                var existingSnapshot = await _context.QuizAttemptSnapshots.Where(x => x.QuizId == quizId.Trim())
                                                                     .Include(x => x.Quiz)
                                                                     .Where(x => x.Quiz.OwnerId == _userContext.UserId
                                                                     && x.Quiz.IsBeingConvertToSnapShot == false)
                                                                     .AsNoTracking()
                                                                     .OrderByDescending(x => x.DateCreated)
                                                                     .FirstOrDefaultAsync();

                if (existingSnapshot != null && !string.IsNullOrEmpty(existingSnapshot.QuizQuestions))
                {
                    var needToCreateSnapShot = await CompareQuizSnapShotContentForCreatingNewOne(existingSnapshot,quizId);
                    if (!needToCreateSnapShot.Result && needToCreateSnapShot.Message == null)
                    {
                        var mappedResult = _mapper.Map<QuizAttemptSnapshotDTO>(existingSnapshot);
                        mappedResult.QuizQuestionsParsed = JsonSerializer.Deserialize<List<QuestionDTO>>(mappedResult.QuizQuestions)!;
                        //Remove the IsCorrect property from the choices to prevent cheating
                        foreach (var question in mappedResult.QuizQuestionsParsed.Where(q => q.Choices != null && q.Choices.Count > 0))
                        {
                            foreach (var choice in question.Choices)
                            {
                                choice.IsCorrect = false;
                            }
                        }
                        //After that set quiz questions to "" for cleaner result
                        mappedResult.QuizQuestions = "";
                        result.Result = mappedResult;
                    }
                    else if (needToCreateSnapShot.Result)
                    {
                        // Snapshot creation enqueued, return empty result, frontend based on empty result to display that quiz is being prepared
                        return result;
                    }
                    else if (needToCreateSnapShot.Message != null)
                    {
                        result.Message = needToCreateSnapShot.Message;
                    }
                }
                else
                {
                    var fetchedQuiz = await _context.Quizzes.Where(x => x.Id == quizId).FirstOrDefaultAsync();
                    if(!(fetchedQuiz != null && fetchedQuiz.IsBeingConvertToSnapShot))
                    {
                        //Return the appropriate message if not founds
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                    }

                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        public async Task<ReturnResult<QuizAttemptSnapshot>> CreateSnapShot(string quizId)
        {
            ReturnResult<QuizAttemptSnapshot> result = new ReturnResult<QuizAttemptSnapshot>();
            try
            {
                // Simulate some delay for demonstration purposes, keep this for SignalR demonstration
                await Task.Delay(5000); 
                var existingQuiz = await _context.Quizzes.Where(x => x.Id == quizId.Trim())
                                                .Include(x => x.Questions)
                                                .ThenInclude(q => q.Choices)
                                                .FirstOrDefaultAsync();
                                                
                if(existingQuiz != null)

                {
                    var questionsDto = _mapper.Map<List<QuestionDTO>>(existingQuiz.Questions);

                    var quizSnapShot = new QuizAttemptSnapshot()
                    {
                        QuizId = existingQuiz.Id,
                        QuizQuestions = JsonSerializer.Serialize(questionsDto)
                    };

                    result = await _repository.CreateAsync(quizSnapShot);
                    existingQuiz.IsBeingConvertToSnapShot = false;
                    _context.Quizzes.Update(existingQuiz);
                    await _context.SaveChangesAsync();
                    //This is used to push notification to the user that the snapshot is created
                    await _snapshotHub.Clients.User(existingQuiz.OwnerId).CompleteCreateQuizAttemptSnapshot(new { quizId = existingQuiz.Id, quiztitle = existingQuiz.Title });
                    //This is used to make the frontend reload the page if the user is currently on the quiz attempt page
                    await _snapshotHub.Clients.User(existingQuiz.OwnerId).ReloadQuizAttemptSnapshot(new { quizId = existingQuiz.Id });
                }
                else
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        private async Task<ReturnResult<bool>> CompareQuizSnapShotContentForCreatingNewOne(QuizAttemptSnapshot existingSnapshot,string quizId)
        {
            ReturnResult<bool> result = new ReturnResult<bool>();

            try
            {
                // Default to false - no need to create snapshot
                result.Result = false;

                // Fetch quiz with questions and choices
                var existingQuiz = await _context.Quizzes.Where(x => x.Id == quizId.Trim())
                                                        .Include(x => x.Questions)
                                                        .ThenInclude(q => q.Choices)
                                                        .FirstOrDefaultAsync();

                if (existingQuiz == null)
                {
                    result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz", quizId);
                    return result;
                }

                // If snapshot exists, compare content
                if (existingSnapshot != null)
                {
                    var currentQuestionsDto = _mapper.Map<List<QuestionDTO>>(existingQuiz.Questions);
                    var snapshotQuestionsDto = JsonSerializer.Deserialize<List<QuestionDTO>>(existingSnapshot.QuizQuestions);
                    result.Result = snapshotQuestionsDto == null || HasContentChanged(currentQuestionsDto, snapshotQuestionsDto);
                }
                else
                {
                    // No snapshot exists - need to create one
                    result.Result = true;
                }

                // Enqueue background job if snapshot creation is needed
                if (result.Result)
                {
                    existingQuiz.IsBeingConvertToSnapShot = true;
                    _context.Quizzes.Update(existingQuiz);
                    BackgroundJob.Enqueue<IQuizAttemptSnapshotBusiness>(x => x.CreateSnapShot(quizId));
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message ?? ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
                StudyNestLogger.Instance.Error(ex);
            }
            return result;
        }
        private bool HasContentChanged(List<QuestionDTO> current, List<QuestionDTO> snapshot)
        {
            // Sort both lists by Question Id for consistent comparison
            var currentSorted = current
                .OrderBy(q => q.Id)
                .Select(q => new
                {
                    Question = q,
                    SortedChoices = q.Choices?.OrderBy(c => c.Id).ToList()
                })
                .ToList();

            var snapshotSorted = snapshot
                .OrderBy(q => q.Id)
                .Select(q => new
                {
                    Question = q,
                    SortedChoices = q.Choices?.OrderBy(c => c.Id).ToList()
                })
                .ToList();

            // Check if question count differs
            if (currentSorted.Count != snapshotSorted.Count)
                return true;

            // Compare each question
            for (int i = 0; i < currentSorted.Count; i++)
            {
                var curr = currentSorted[i].Question;
                var snap = snapshotSorted[i].Question;

                // Compare question properties
                if (curr.Id != snap.Id ||
                    curr.Name != snap.Name ||
                    curr.Type != snap.Type ||
                    curr.Explanation != snap.Explanation ||
                    currentSorted[i].SortedChoices?.Count != snapshotSorted[i].SortedChoices?.Count)
                {
                    return true;
                }

                // Compare choices if both exist
                var currChoices = currentSorted[i].SortedChoices;
                var snapChoices = snapshotSorted[i].SortedChoices;

                if (currChoices != null && snapChoices != null)
                {
                    for (int j = 0; j < currChoices.Count; j++)
                    {
                        if (currChoices[j].Id != snapChoices[j].Id ||
                            currChoices[j].Text != snapChoices[j].Text ||
                            currChoices[j].IsCorrect != snapChoices[j].IsCorrect)
                        {
                            return true;
                        }
                    }
                }
            }
            // No changes detected
            return false;
        }
    }
}
