using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualBasic;
using StudyNest.Common.DbEntities.Entities;
using StudyNest.Common.Interfaces;
using StudyNest.Common.Models.DTOs.EntityDTO.Quizzes;
using StudyNest.Common.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static StudyNest.Common.Llm.Configurations.LlmConfigurations;
using static System.Net.Mime.MediaTypeNames;

namespace StudyNest.Common.Llm.Providers
{
    public class GeminiClient : ILlmClient
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;
        private readonly ISettingBusiness _setting;

        public GeminiClient(HttpClient httpClient, IConfiguration cfg, ISettingBusiness settingBusiness)
        {
            this._http = httpClient;
            this._cfg = cfg;
            this._setting = settingBusiness;
        }

        public async Task<string> GenerateAsync(string prompt, IReadOnlyList<string> imageUrls)
        {
            var settingResult = await _setting.GetOneByKeyAndGroup("GEMINI_API_KEYS", "AI_CONFIG", true);
            if (settingResult.Result == null || string.IsNullOrEmpty(settingResult.Result.Value))
            {
                throw new InvalidOperationException("Missing ApiKeys Gemini in configuration.");
            }
            string actualJsonString = settingResult.Result.Value;

            var allConfigs = JsonSerializer.Deserialize<List<ApiKeyConfig>>(actualJsonString);
            var usableKeys = allConfigs
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority)
                .ToList();

            if (!usableKeys.Any())
            {
                throw new InvalidOperationException("No active Gemini API Keys found.");
            }

            var parts = new List<Dictionary<string, object>>
                {
                    new() { ["text"] = prompt }
                };

            foreach (var url in imageUrls ?? Array.Empty<string>())
            {
                if (string.IsNullOrWhiteSpace(url)) continue;

                byte[] bytes;
                try
                {
                    bytes = await _http.GetByteArrayAsync(url);
                }
                catch (Exception ex)
                {
                    StudyNestLogger.Instance.Warn($"Skip image (download failed): {url}. {ex.Message}");
                    continue;
                }

                var base64 = Convert.ToBase64String(bytes);
                parts.Add(new Dictionary<string, object>
                {
                    ["inline_data"] = new Dictionary<string, object>
                    {
                        ["mime_type"] = InferImageMimeType(url),
                        ["data"] = base64
                    }
                });
            }

            var payload = new Dictionary<string, object>
            {
                ["contents"] = new object[]
                {
                    new Dictionary<string, object>
                    {
                        ["role"]  = "user",
                        ["parts"] = parts
                    }
                },
                ["generation_config"] = new Dictionary<string, object>
                {
                    ["response_mime_type"] = "application/json"
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            Exception lastException = null;

            foreach (var config in usableKeys)
            {
                try
                {
                    var model = "gemini-2.5-flash";
                    var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={config.Key}";

                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(120));
                    using var req = new HttpRequestMessage(HttpMethod.Post, endpoint)
                    {
                        Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                    };

                    using var res = await _http.SendAsync(req, cts.Token);

                    if (res.IsSuccessStatusCode)
                    {
                        var body = await res.Content.ReadAsStringAsync(cts.Token);
                        using var doc = JsonDocument.Parse(body);

                        if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                        {
                            var partsOut = candidates[0].GetProperty("content").GetProperty("parts");
                            var sb = new StringBuilder();
                            foreach (var p in partsOut.EnumerateArray())
                            {
                                if (p.TryGetProperty("text", out var t))
                                    sb.Append(t.GetString());
                            }
                            return sb.ToString().Trim();
                        }
                        throw new Exception("Gemini returned success but no content (Safety Filter triggered?).");
                    }
                    else
                    {
                        var errorBody = await res.Content.ReadAsStringAsync();
                        throw new HttpRequestException($"Status: {res.StatusCode}, Detail: {errorBody}", null, res.StatusCode);
                    }
                }
                catch (HttpRequestException ex)
                {
                    lastException = ex;

                    if (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        (int?)ex.StatusCode >= 500 ||
                        ex.StatusCode == System.Net.HttpStatusCode.Unauthorized ||
                        ex.StatusCode == System.Net.HttpStatusCode.BadRequest) 
                    {
                        StudyNestLogger.Instance.Warn($"Key Priority {config.Priority} failed ({ex.StatusCode}). Switching to next key...");
                        await Task.Delay(5000);
                        continue;
                    }

                    throw;
                }
                catch (Exception ex)
                {
                    lastException = ex;
                    StudyNestLogger.Instance.Warn($"Unknown error with Key Priority {config.Priority}: {ex.Message}. Switching...");
                    await Task.Delay(5000);
                    continue;
                }
            }

            StudyNestLogger.Instance.Error("All Gemini API keys failed.");
            throw new Exception("Gemini service unavailable after trying all keys.", lastException);
        }
        private static string InferImageMimeType(string url)
        {
            var lower = (url ?? "").Split('?')[0].ToLowerInvariant();
            if (lower.EndsWith(".png")) return "image/png";
            if (lower.EndsWith(".webp")) return "image/webp";
            if (lower.EndsWith(".gif")) return "image/gif";
            if (lower.EndsWith(".bmp")) return "image/bmp";
            if (lower.EndsWith(".svg")) return "image/svg+xml";
            if (lower.EndsWith(".jpg") || lower.EndsWith(".jpeg") || lower.Contains("/image/upload/")) return "image/jpeg";
            return "image/jpeg";
        }


    }
}
