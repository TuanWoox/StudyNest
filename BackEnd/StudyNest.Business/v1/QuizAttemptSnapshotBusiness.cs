using AutoMapper;
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

                // If found and the quiz questions are not null or empty, map to DTO and deserialize the questions
                if (existingSnapshot != null && !string.IsNullOrEmpty(existingSnapshot.QuizQuestions))
                {
                    
                    var mappedResult = _mapper.Map<QuizAttemptSnapshotDTO>(existingSnapshot);
                    mappedResult.QuizQuestionsParsed = JsonSerializer.Deserialize<List<QuestionDTO>>(mappedResult.QuizQuestions)!;
                    //Remove the IsCorrect property from the choices to prevent cheating
                    foreach (var question in mappedResult.QuizQuestionsParsed)
                    {
                        if(question.Choices != null && question.Choices.Count > 0)
                        {
                            foreach(var choice in question.Choices)
                            {
                                choice.IsCorrect = false;
                            }
                        }
                    }
                    //After that set quiz questiosn to "" for cleaner result
                    mappedResult.QuizQuestions = "";
                    //Assign the mapped result to the return result
                    result.Result = mappedResult;
                }
                else
                {
                    var fetchedQuiz = await _context.Quizzes.Where(x => x.Id == quizId).FirstOrDefaultAsync();
                    if(!(fetchedQuiz != null && fetchedQuiz.IsBeingConvertToSnapShot == true))
                    {
                        //Return the appropriate message if not founds
                        result.Message = string.Format(ResponseMessage.MESSAGE_ITEM_NOT_FOUND, "quiz snapshot", quizId);
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
                await Task.Delay(20000); // Simulate some delay for demonstration purposes
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
    }
}
