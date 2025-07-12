using System.Net;
using System.Text.Json;

namespace VaultNotary.Web.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse();

        switch (exception)
        {
            case InvalidOperationException ex when ex.Message.Contains("transaction code", StringComparison.OrdinalIgnoreCase) && 
                                                   ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase):
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                response.Error = "Duplicate Transaction Code";
                response.Message = ex.Message;
                response.Code = "DUPLICATE_TRANSACTION_CODE";
                break;

            case InvalidOperationException ex when ex.Message.Contains("Customer", StringComparison.OrdinalIgnoreCase) && 
                                                   ex.Message.Contains("does not exist", StringComparison.OrdinalIgnoreCase):
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Error = "Customer Not Found";
                response.Message = ex.Message;
                response.Code = "CUSTOMER_NOT_FOUND";
                break;

            case InvalidOperationException ex:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Error = "Invalid Operation";
                response.Message = ex.Message;
                response.Code = "INVALID_OPERATION";
                break;

            case ArgumentNullException ex:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Error = "Missing Required Parameter";
                response.Message = ex.Message;
                response.Code = "MISSING_PARAMETER";
                break;

            case ArgumentException ex:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Error = "Invalid Request";
                response.Message = ex.Message;
                response.Code = "INVALID_REQUEST";
                break;

            case KeyNotFoundException ex:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Error = "Resource Not Found";
                response.Message = ex.Message;
                response.Code = "NOT_FOUND";
                break;

            case UnauthorizedAccessException ex:
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                response.Error = "Access Denied";
                response.Message = ex.Message;
                response.Code = "ACCESS_DENIED";
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Error = "Internal Server Error";
                response.Message = "An unexpected error occurred while processing your request";
                response.Code = "INTERNAL_ERROR";
                response.Details = exception.Message;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

