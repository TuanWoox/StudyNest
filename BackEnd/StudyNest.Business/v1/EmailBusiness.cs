using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Models.DTOs.ViewSettingDTO;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudyNest.Business.v1
{
    public class EmailBusiness : IEmailBusiness
    {
        private readonly IConfiguration _config;
        private readonly ISettingBusiness _settingBusiness;

        public EmailBusiness(IConfiguration config, ISettingBusiness settingBusiness)
        {
            _config = config;
            _settingBusiness = settingBusiness;
        }

        public async Task<ReturnResult<bool>> SendAsync(string toEmail, string subject, string htmlBody)
        {
            var result = new ReturnResult<bool>();

            try
            {
                // load SMTP config from system settings
                var smtpSettingResult = await _settingBusiness.GetOneByKeyAndGroup("SMTP_CONFIG", "EMAIL_CONFIG", true);
                var smtpConfigString = smtpSettingResult.Result?.Value;

                if (string.IsNullOrWhiteSpace(smtpConfigString))
                {
                    result.Message = "The email service is currently unavailable. Please try again later.";
                    StudyNestLogger.Instance.Error("SMTP configuration missing or empty.");
                    return result;
                }

                SMTPSettingDTO smtpConfig;
                try
                {
                    smtpConfig = JsonSerializer.Deserialize<SMTPSettingDTO>(smtpConfigString)
                                 ?? throw new InvalidOperationException("Failed to parse SMTP configuration.");
                }
                catch (Exception ex)
                {
                    result.Message = "The email service is temporarily experiencing issues. Please try again soon.";
                    StudyNestLogger.Instance.Error(ex);
                    return result;
                }

                var message = new MimeMessage();
                message.From.Add(MailboxAddress.Parse(smtpConfig.From));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;
                message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

                using var client = new SmtpClient();

                try
                {
                    var host = smtpConfig.Host;
                    var port = smtpConfig.Port != 0 ? smtpConfig.Port : 587;
                    var user = smtpConfig.Username;
                    var pass = smtpConfig.Password;

                    SecureSocketOptions socketOptions =
                        port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;

                    await client.ConnectAsync(host, port, socketOptions);

                    if (!string.IsNullOrEmpty(user))
                        await client.AuthenticateAsync(user, pass);

                    await client.SendAsync(message);
                    result.Result = true;
                }
                catch (SmtpCommandException ex)
                {
                    result.Message = "Unable to send the email at the moment. Please verify your email address or try again later.";
                    StudyNestLogger.Instance.Error(ex);
                    return result;
                }
                catch (SmtpProtocolException ex)
                {
                    result.Message = "There was a temporary issue with the email service. Please try again shortly.";
                    StudyNestLogger.Instance.Error(ex);
                    return result;
                }
                catch (Exception ex)
                {
                    result.Message = "An unexpected error occurred while sending the email. Please try again.";
                    StudyNestLogger.Instance.Error(ex);
                    return result;
                }
                finally
                {
                    try
                    {
                        if (client.IsConnected)
                            await client.DisconnectAsync(true);
                    }
                    catch (Exception ex)
                    {
                        StudyNestLogger.Instance.Error("Failed to disconnect SMTP client: " + ex.Message, ex);
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = "An unexpected error occurred. Please try again.";
                StudyNestLogger.Instance.Error(ex);
            }

            return result;
        }
    }
}
