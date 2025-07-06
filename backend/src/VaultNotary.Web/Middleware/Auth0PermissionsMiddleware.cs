using System.Security.Claims;
using System.Text.Json;

namespace VaultNotary.Web.Middleware;

public class Auth0PermissionsMiddleware
{
    private readonly RequestDelegate _next;

    public Auth0PermissionsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Extract permissions from the permissions claim (Auth0 format)
            var permissionsClaim = context.User.FindFirst("permissions");
            if (permissionsClaim != null)
            {
                try
                {
                    var permissions = JsonSerializer.Deserialize<string[]>(permissionsClaim.Value);
                    if (permissions != null)
                    {
                        var identity = context.User.Identity as ClaimsIdentity;
                        foreach (var permission in permissions)
                        {
                            identity?.AddClaim(new Claim("permissions", permission));
                        }
                    }
                }
                catch (JsonException)
                {
                    // If permissions claim is not a JSON array, treat it as a single permission
                    var identity = context.User.Identity as ClaimsIdentity;
                    identity?.AddClaim(new Claim("permissions", permissionsClaim.Value));
                }
            }

            // Extract roles from the roles claim
            var rolesClaim = context.User.FindFirst(ClaimTypes.Role) ?? 
                           context.User.FindFirst("https://vaultnotary.com/roles");
            
            if (rolesClaim != null)
            {
                try
                {
                    var roles = JsonSerializer.Deserialize<string[]>(rolesClaim.Value);
                    if (roles != null)
                    {
                        var identity = context.User.Identity as ClaimsIdentity;
                        foreach (var role in roles)
                        {
                            identity?.AddClaim(new Claim(ClaimTypes.Role, role));
                        }
                    }
                }
                catch (JsonException)
                {
                    // If roles claim is not a JSON array, treat it as a single role
                    var identity = context.User.Identity as ClaimsIdentity;
                    identity?.AddClaim(new Claim(ClaimTypes.Role, rolesClaim.Value));
                }
            }
        }

        await _next(context);
    }
}