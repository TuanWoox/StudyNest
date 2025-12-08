using Hangfire;
using Hangfire.PostgreSql;
using HangfireBasicAuthenticationFilter;

namespace StudyNest.Infrastructures.Hangfire
{
    public static class HangfireSetupExtension
    {
        //Extend method for services to add hangfire services and hangfire server
        public static IServiceCollection AddHangfireSetup(this IServiceCollection services, IConfiguration configuration)
        {
            var storageOptions = CreateStorageOptions();
            //We need to use seperate connection because DefaultConnection does not accept Allow User Variables = True
            var hangfireConnection = configuration.GetConnectionString("DefaultConnection");

            services.AddHangfire((provider, configuration) =>
            {
                var storage = new PostgreSqlStorage(hangfireConnection, storageOptions);
                configuration
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UseStorage(storage);

            });

            ConfigureHangfireServer(services);
            return services;
        }
        //Extend method for application builder to use dashboard
        public static IApplicationBuilder AddHangfireDashBoardSetup(this IApplicationBuilder app, IConfiguration configuration)
        {

            app.UseHangfireDashboard("/backgroundjobs/hangfire", new DashboardOptions
            {
                Authorization = new[]
             {
                    new HangfireCustomBasicAuthenticationFilter
                    {
                         User = configuration["AccountToAccessHangfireDashboard:User"],
                         Pass = configuration["AccountToAccessHangfireDashboard:Password"]
                    }
                }
            });

            return app;
        }
        private static PostgreSqlStorageOptions CreateStorageOptions()
        {
            return new PostgreSqlStorageOptions();
        }
        private static void ConfigureHangfireServer(IServiceCollection services)
        {
            services.AddHangfireServer(options =>
            {
                options.WorkerCount = 3;
                options.ServerTimeout = TimeSpan.FromMinutes(5);
                options.ShutdownTimeout = TimeSpan.FromMinutes(5);
                options.ServerName = $"Hangfire.Server.{Environment.MachineName}";
                options.Queues = new[] { "default" };
                options.SchedulePollingInterval = TimeSpan.FromMilliseconds(500); // Check every 500ms
            });
        }
    }
}
