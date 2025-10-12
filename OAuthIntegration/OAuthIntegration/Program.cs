using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using OAuthIntegration.Common.Utils.Extensions;
using OAuthIntegration.Data;
using System.Threading.Tasks;

namespace OAuthIntegration
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            try
            {
                var webHost = CreateHostBuilder(args).Build();

                await webHost.RunAsync();
            }
            catch (Exception ex)
            {
                OauthIntegrationLogger.Instance.Error(ex);
                // If the application crashes, wait for 10 seconds before restarting
                Thread.Sleep(10000);
                await Main(args);
            }

        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}

