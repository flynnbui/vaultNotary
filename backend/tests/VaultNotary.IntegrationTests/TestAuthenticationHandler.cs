using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using VaultNotary.Web.Authorization;

namespace VaultNotary.IntegrationTests;

public class TestAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim("permissions", Permissions.ReadCustomers),
            new Claim("permissions", Permissions.CreateCustomers),
            new Claim("permissions", Permissions.UpdateCustomers),
            new Claim("permissions", Permissions.DeleteCustomers),
            new Claim("permissions", Permissions.SearchCustomers),
            new Claim("permissions", Permissions.ReadDocuments),
            new Claim("permissions", Permissions.CreateDocuments),
            new Claim("permissions", Permissions.UpdateDocuments),
            new Claim("permissions", Permissions.DeleteDocuments),
            new Claim("permissions", Permissions.SearchDocuments),
            new Claim("permissions", Permissions.UploadFiles),
            new Claim("permissions", Permissions.DownloadFiles),
            new Claim("permissions", Permissions.DeleteFiles),
            new Claim("permissions", Permissions.AdminAccess)
        };

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}