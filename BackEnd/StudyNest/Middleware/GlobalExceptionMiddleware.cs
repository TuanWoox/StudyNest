using StudyNest.Common.Models.DTOs.CoreDTO;
using StudyNest.Common.Utils.Extensions;

namespace StudyNest.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                StudyNestLogger.Instance.Error(ex.ToString());

                var result = new ReturnResult<bool>
                {
                    Result = false,
                    Message = ex.Message
                };

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsJsonAsync(result);
            }
        }
    }
}
