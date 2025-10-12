using Microsoft.Extensions.DependencyInjection;
using OAuthIntegration.Business.v1;
using OAuthIntegration.Common.Interface;


namespace OAuthIntegration.Business.Repository
{
    public static class OAuthIntegrationServiceConfiguration
    {
        public static IServiceCollection RegisterOAuthService(this IServiceCollection services)
        {
            services.AddHttpClient();
            services.AddScoped<IAuthBusiness, AuthBusiness>();
            return services;
        }
    }
}
