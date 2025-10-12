using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using OAuthIntegration.Business.Repository;
using OAuthIntegration.Common.DbEntities.Identities;
using OAuthIntegration.Data;
using OAuthIntegration.Middleware;


namespace OAuthIntegration
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
            services.AddAuthorization();
            AddAPIVersioning(services);
            AddControllerWithNewtonsoftJson(services);
            AddCorsDomain(services);
            ConfigureAuthService(services);
            ConfigureDatabase(services);
            ConfigureScopedServices(services);
            AddSwaggerService(services);
        }
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, IApiVersionDescriptionProvider provider)
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
            app.UseWebSockets();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
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

        #region Configure Auth For Google Integration
        private void ConfigureAuthService(IServiceCollection services)
        {
            services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");

            // ✅ Configure multiple schemes properly
            services.AddAuthentication(options =>
            {
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
                    npgsqlOptions.MigrationsAssembly("OAuthIntegration");
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorCodesToAdd: null);
                });
            });
        }
        #endregion

        #region Configure Dependency Injection
        private void ConfigureScopedServices(IServiceCollection services)
        {
            services.RegisterOAuthService();
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
    }
}
