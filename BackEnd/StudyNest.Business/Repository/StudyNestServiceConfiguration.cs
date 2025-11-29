using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using System.Threading.Tasks;
using StudyNest.Common.Interfaces;
using StudyNest.Business.v1;
using StudyNest.Common.Llm;
using StudyNest.Common.Llm.Providers;
using StudyNest.Common.Security;

namespace StudyNest.Business.Repository
{
    public static class StudyNestServiceConfiguration
    {
        public static IServiceCollection RegisterStudyNestService(this IServiceCollection services)
        {
            services.AddHttpClient();
            services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
            services.AddScoped<IUserBusiness, UserBusiness>();
            services.AddScoped<IAuthBusiness, AuthBusiness>();
            services.AddScoped<IQuizBusiness, QuizBusiness>();
            services.AddScoped<ILlmQuizGenerator, LlmQuizGenerator>();
            services.AddScoped<IFolderBusiness, FolderBusiness>();
            services.AddScoped<ITagBusiness, TagBusiness>();
            services.AddScoped<INoteBusiness, NoteBusiness>();
            services.AddScoped<INoteTagBusiness, NoteTagBusiness>();
            services.AddScoped<QuizGenerationPipeline>();
            services.AddHttpClient<ILlmClient, GeminiClient>();
            services.AddScoped<IUserContext, HttpUserContext>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<ISettingBusiness, SettingBusiness>();
            services.AddScoped<IQuizAttemptSnapshotBusiness, QuizAttemptSnapshotBusiness>();
            services.AddScoped<IQuizAttemptBusiness, QuizAttemptBusiness>();
            services.AddScoped<IQuizAttemptAnswerBusiness, QuizAttemptAnswerBusiness>();
            services.AddScoped<IQuestionBusiness, QuestionBusiness>();
            services.AddScoped<IQuizJobBusiness, QuizJobBusiness>();
            services.AddScoped<IQuizStatisticsBusiness, QuizStatisticsBusiness>();
            services.AddScoped<IFeedBackBusiness, FeedBackBusiness>();
            services.AddScoped<IEmailBusiness, EmailBusiness>();
            return services;
        }
    }

}
