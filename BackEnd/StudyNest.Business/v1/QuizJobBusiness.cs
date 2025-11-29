using Hangfire;
using Hangfire.Storage;
using Hangfire.Storage.Monitoring;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class QuizJobBusiness : IQuizJobBusiness
    {
        private readonly IMonitoringApi _api = JobStorage.Current.GetMonitoringApi();
        private readonly IUserContext _userContext;
        public QuizJobBusiness(IUserContext userContext)
        {
            _userContext = userContext;
        }
        public Task<ReturnResult<List<QuizJobDTO>>> GetProcessingQuizJob()
        {
            var rs = new ReturnResult<List<QuizJobDTO>>
            {
                Result = new List<QuizJobDTO>(),
                Message = ""
            };

            try
            {
                const int take = 100;
                var now = DateTime.UtcNow;
                var connection = JobStorage.Current.GetConnection();

                var processingJobs = _api.ProcessingJobs(0, take)
                    .Where(kv => ContainsUser(kv.Value, _userContext.UserId))
                    .Select(kv =>
                    {
                        var dto = kv.Value;
                        var noteTitle = connection.GetJobParameter(kv.Key, "NoteTitle") ?? "Unknown Note";
                        var timestamp = connection.GetJobParameter(kv.Key, "Timestamp");
                        var customJobId = connection.GetJobParameter(kv.Key, "CustomJobId") ?? kv.Key;

                        var startedAt = dto.StartedAt ?? now;

                        return new QuizJobDTO
                        {
                            JobId = customJobId,
                            UserId = _userContext.UserId,
                            NoteTitle = noteTitle,
                            Status = "processing",
                            Timestamp = timestamp ?? startedAt.ToString("o"),
                            CreatedAt = startedAt
                        };
                    });

                var enqueuedJobs = _api.Queues()
                    .SelectMany(q => _api.EnqueuedJobs(q.Name, 0, take))
                    .Where(kv => ContainsUser(kv.Value, _userContext.UserId))
                    .Select(kv =>
                    {
                        var dto = kv.Value;
                        var noteTitle = connection.GetJobParameter(kv.Key, "NoteTitle") ?? "Unknown Note";
                        var timestamp = connection.GetJobParameter(kv.Key, "Timestamp");
                        var customJobId = connection.GetJobParameter(kv.Key, "CustomJobId") ?? kv.Key;

                        var enqueuedAt = dto.EnqueuedAt ?? now;

                        return new QuizJobDTO
                        {
                            JobId = customJobId,
                            UserId = _userContext.UserId,
                            NoteTitle = noteTitle,
                            Status = "processing",
                            Timestamp = timestamp ?? enqueuedAt.ToString("o"),
                            CreatedAt = enqueuedAt
                        };
                    });

                rs.Result = processingJobs
                    .Concat(enqueuedJobs)
                    .GroupBy(j => j.JobId)
                    .Select(g => g.First())
                    .OrderByDescending(j => j.CreatedAt)
                    .Take(10)
                    .ToList();
            }
            catch (Exception ex)
            {
                rs.Result = new List<QuizJobDTO>();
                rs.Message = "Unable to fetch processing jobs. Please try again.";
                StudyNestLogger.Instance.Error($"[QuizJob] Error fetching processing/enqueued jobs for user {_userContext.UserId}: {ex}");
            }

            return Task.FromResult(rs);
        }


        public Task<ReturnResult<List<QuizJobDTO>>> GetRecentQuizJob(long sinceEpochMs)
        {
            var rs = new ReturnResult<List<QuizJobDTO>>()
            {
                Result = new List<QuizJobDTO>(),
                Message = ""
            };

            try
            {
                var since = DateTimeOffset.FromUnixTimeMilliseconds(sinceEpochMs).UtcDateTime;
                const int take = 100;
                var connection = JobStorage.Current.GetConnection();

                var succ = _api.SucceededJobs(0, take);
                foreach (var kv in succ)
                {
                    var dto = kv.Value;
                    if (dto.SucceededAt >= since && ContainsUser(dto, _userContext.UserId))
                    {
                        var noteTitle = connection.GetJobParameter(kv.Key, "NoteTitle") ?? "Unknown Note";
                        var timestamp = connection.GetJobParameter(kv.Key, "Timestamp");
                        var customJobId = connection.GetJobParameter(kv.Key, "CustomJobId") ?? kv.Key;
                        var quizId = connection.GetJobParameter(kv.Key, "QuizId");
                        
                        rs.Result.Add(new QuizJobDTO
                        {
                            JobId = customJobId,
                            UserId = _userContext.UserId,
                            NoteTitle = noteTitle,
                            QuizId = quizId,
                            Status = "success",
                            Timestamp = timestamp ?? (dto.SucceededAt ?? DateTime.UtcNow).ToString("o"),
                            CreatedAt = dto.SucceededAt ?? DateTime.UtcNow
                        });
                    }
                }

                var failed = _api.FailedJobs(0, take);
                foreach (var kv in failed)
                {
                    var dto = kv.Value;
                    if (dto.FailedAt >= since && ContainsUser(dto, _userContext.UserId))
                    {
                        var noteTitle = connection.GetJobParameter(kv.Key, "NoteTitle") ?? "Unknown Note";
                        var timestamp = connection.GetJobParameter(kv.Key, "Timestamp");
                        var customJobId = connection.GetJobParameter(kv.Key, "CustomJobId") ?? kv.Key;
                        
                        rs.Result.Add(new QuizJobDTO
                        {
                            JobId = customJobId,
                            UserId = _userContext.UserId,
                            NoteTitle = noteTitle,
                            Status = "error",
                            ErrorMessage = dto.ExceptionMessage ?? "An unexpected error occurred.",
                            Timestamp = timestamp ?? (dto.FailedAt ?? DateTime.UtcNow).ToString("o"),
                            CreatedAt = dto.FailedAt ?? DateTime.UtcNow
                        });
                    }
                }

                rs.Result = rs.Result
                    .GroupBy(j => j.JobId)
                    .Select(g => g.First())
                    .OrderByDescending(j => j.CreatedAt)
                    .Take(10)
                    .ToList();
            }
            catch (Exception ex)
            {
                rs.Result = new List<QuizJobDTO>();
                rs.Message = "Unable to fetch recent jobs. Please try again.";
                StudyNestLogger.Instance.Error($"[QuizJob] Error fetching recent jobs for user {_userContext.UserId}: {ex}");
            }

            return Task.FromResult(rs);
        }

        private bool ContainsUser(ProcessingJobDto d, string userId)
        {
            if (d.Job?.Args == null || d.Job.Args.Count == 0) return false;
            var lastArg = d.Job.Args.LastOrDefault()?.ToString();
            return string.Equals(lastArg, userId, StringComparison.Ordinal);
        }

        private bool ContainsUser(EnqueuedJobDto d, string userId)
        {
            if (d.Job?.Args == null || d.Job.Args.Count == 0) return false;
            var lastArg = d.Job.Args.LastOrDefault()?.ToString();
            return string.Equals(lastArg, userId, StringComparison.Ordinal);
        }

        private bool ContainsUser(SucceededJobDto d, string userId)
        {
            if (d.Job?.Args == null || d.Job.Args.Count == 0) return false;
            var lastArg = d.Job.Args.LastOrDefault()?.ToString();
            return string.Equals(lastArg, userId, StringComparison.Ordinal);
        }

        private bool ContainsUser(FailedJobDto d, string userId)
        {
            if (d.Job?.Args == null || d.Job.Args.Count == 0) return false;
            var lastArg = d.Job.Args.LastOrDefault()?.ToString();
            return string.Equals(lastArg, userId, StringComparison.Ordinal);
        }

    }
}
