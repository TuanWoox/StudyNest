using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Win32;
using Newtonsoft.Json;
using OpenAI;
using OpenAI.Chat;
using StudyNest.Business.Repository;
using StudyNest.Business.v1;
using StudyNest.Common.DbEntities.Identities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Utils.Configuration;
using StudyNest.Common.Utils.Extensions;
using StudyNest.Data;
using StudyNest.Infrastructures.Hangfire;
using StudyNest.Middleware;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;


namespace StudyNest
{
    public class Startup
    {
        public static IConfiguration Configuration { get; set; }

        private readonly IWebHostEnvironment env;

        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            this.env = env;
        }

        public void ConfigureServices(IServiceCollection services)
        {

            services.AddEndpointsApiExplorer();

            AddAPIVersioning(services);

            services.Configure<KestrelServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });
            services.Configure<IISServerOptions>(options =>
            {
                options.AllowSynchronousIO = true;
            });

            services.AddHangfireSetup(Configuration);
            HangfireConfiguration.ConfigureGlobalFilters();
            services.AddSignalR();

            AddCorsDomain(services);
            AddControllerWithNewtonsoftJson(services);
            ConfigureAuthService(services);
            ConfigureDatabase(services);
            ConfigurePolicy(services);
            AddSwaggerService(services);
            ConfigureCloudinary(services);
            ConfigureOpenAiClient(services, Configuration);
            ConfigureScopedServices(services);
        }

        public async void Configure(IApplicationBuilder app, IWebHostEnvironment env, IApiVersionDescriptionProvider provider)
        {
            #region Development Configuration
            if (env.IsDevelopment())
            {
                app.UseSwagger();

                app.UseSwaggerUI(options =>
                {
                    foreach (var description in provider.ApiVersionDescriptions)
                    {
                        options.SwaggerEndpoint($"/swagger/{description.GroupName}/swagger.json", description.GroupName.ToUpperInvariant());
                    }
                    options.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");

                });
            }
            #endregion

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("CorsPolicy");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseMiddleware<GlobalExceptionMiddleware>();
            app.UseWebSockets();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<Business.Hubs.QuizAttemptSnapshotHub>("/hub/quiz-attempt-snapshot");
                endpoints.MapHub<Business.Hubs.QuizCreateHub>("/hub/quiz-create");
                endpoints.MapHub<Business.Hubs.QuizSessionHub>("/hub/quiz-session");
            });


            app.AddHangfireDashBoardSetup(Configuration);
            await InitData(app.ApplicationServices);
        }

        #region Add Api Versioning
        private void AddAPIVersioning(IServiceCollection services)
        {
            var apiVersioningBuilder = services.AddApiVersioning(options =>
            {
                options.ReportApiVersions = true;
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
            }).AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });
        }
        #endregion

        #region AddCorsDomain
        private void AddCorsDomain(IServiceCollection services)
        {
            services.AddCors(opt =>
            {
                opt.AddPolicy("CorsPolicy", builderCors =>
                {
                    var corsLst = Configuration.GetSection("AllowCors").GetChildren().Select(x => x.Value).ToArray();
                    builderCors
                       .WithOrigins(corsLst)
                       .SetIsOriginAllowedToAllowWildcardSubdomains()
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials();
                });
            });
        }
        #endregion

        #region Add Controlller and NewtonsoftJson to it
        private void AddControllerWithNewtonsoftJson(IServiceCollection services)
        {
            services.AddControllers()
                    .AddNewtonsoftJson(options =>
                    {
                        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                    });
        }
        #endregion

        #region Configure Auth And JWT
        private void ConfigureAuthService(IServiceCollection services)
        {
            services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

            // ✅ Configure multiple schemes properly
            services.AddAuthentication(options =>
            {
                // JWT is the default for API authentication
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

                // ✅ Cookie is ONLY for Google OAuth sign-in flow
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                // ✅ Cookie is only for temporary Google OAuth flow
                options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
                options.SlidingExpiration = false;
            })
            .AddGoogle(options =>
            {
                var clientId = Configuration["Authentication:Google:ClientId"];
                if (clientId == null)
                    throw new ArgumentNullException(nameof(clientId));

                var clientSecret = Configuration["Authentication:Google:ClientSecret"];
                if (clientSecret == null)
                    throw new ArgumentNullException(nameof(clientSecret));

                options.ClientId = clientId;
                options.ClientSecret = clientSecret;
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;

                // ✅ Request necessary scopes
                options.Scope.Add("profile");
                options.Scope.Add("email");

                // ✅ Save tokens if needed
                options.SaveTokens = true;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:Issuer"],
                    ValidAudience = Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // For SignalR/WebSocket
                        var accessToken = context.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"JWT Auth failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            });

            // Rest of your Identity configuration
            services.AddIdentityCore<ApplicationUser>(opt =>
            {
                opt.Password.RequiredLength = 6;
                opt.Password.RequireDigit = true;
                opt.Password.RequireNonAlphanumeric = true;
                opt.Password.RequireUppercase = true;
                opt.Password.RequireLowercase = true;
                opt.SignIn.RequireConfirmedEmail = true;
            })
            .AddRoles<ApplicationRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddRoleValidator<RoleValidator<ApplicationRole>>()
            .AddRoleManager<RoleManager<ApplicationRole>>()
            .AddSignInManager<SignInManager<ApplicationUser>>()
            .AddDefaultTokenProviders();

            // Configure password-reset token lifespan to 5 minutes
            services.Configure<DataProtectionTokenProviderOptions>(opts =>
            {
                opts.TokenLifespan = TimeSpan.FromMinutes(5);
            });

            services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = true;
                hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(5);
            });
        }
        #endregion

        #region Configure Database
        private void ConfigureDatabase(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly("StudyNest");
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorCodesToAdd: null);
                });
            });
        }
        #endregion

        #region Configure Policy
        private void ConfigurePolicy(IServiceCollection services)
        {
            // Allows access to HttpContext in services via IHttpContextAccessor outside controllers
            services.AddHttpContextAccessor();
            // Registers AutoMapper with the custom mapping profile. used to map DTO to real entity and vice versa
            services.AddAutoMapper((serviceProvider, cfg) =>
            {
                cfg.LicenseKey = Configuration.GetValue<string>("AutoMapper:LicenseKey");
            }, typeof(StudyNestMapper).Assembly);
        }
        #endregion

        #region Configure Dependency Injection
        private void ConfigureScopedServices(IServiceCollection services)
        {
            services.RegisterStudyNestService();
        }
        #endregion

        #region Configure Swwagger
        private void AddSwaggerService(IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                OpenApiSecurityScheme securityDefinition = new OpenApiSecurityScheme()
                {
                    Name = "Bearer",
                    BearerFormat = "JWT",
                    Scheme = "bearer",
                    Description = "Use auth/login to earn your JWT token. Then, please Enter your JWT token to here",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                };
                c.AddSecurityDefinition("jwt_auth", securityDefinition);

                c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "jwt_auth"
                            },
                        },
                        new List<string>()
                    }
                });
            });
            services.ConfigureOptions<ConfigureSwaggerOptions>();

        }
        #endregion

        #region Configure Cloudinary
        public void ConfigureCloudinary(IServiceCollection services)
        {
            var cloudName = Configuration.GetValue<string>("CloudinarySettings:CloudName");
            var apiKey = Configuration.GetValue<string>("CloudinarySettings:ApiKey");
            var apiSecret = Configuration.GetValue<string>("CloudinarySettings:ApiSecret");
            // Ensure none of them are null/empty
            if (!new[] { cloudName, apiKey, apiSecret }.Any(string.IsNullOrEmpty))
            {
                var account = new Account(cloudName, apiKey, apiSecret);
                var cloudinary = new Cloudinary(account);
                services.AddSingleton(cloudinary);
            }
        }
        #endregion

        #region Configure OpenAi Client
        public void ConfigureOpenAiClient(IServiceCollection services, IConfiguration config)
        {
            var apiKey = Configuration.GetValue<string>("OpenAi:ApiKey");
            if (!string.IsNullOrEmpty(apiKey))
            {
                StudyNestLogger.Instance.Info("Adding Open AI");
                services.AddSingleton(new OpenAIClient(apiKey));
            }
        }
        #endregion

        #region Init Default Data 
        private async Task InitData(IServiceProvider serviceProvider)
        {
            try
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var userBusiness = scope.ServiceProvider.GetRequiredService<IUserBusiness>();
                    await userBusiness.InitData();
                }
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex);

            }
        }
        #endregion

    }

}
