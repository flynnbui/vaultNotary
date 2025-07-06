using Microsoft.AspNetCore.Authorization;

namespace VaultNotary.Web.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User == null)
        {
            return Task.CompletedTask;
        }

        // Check if user has the required permission
        var permissionClaim = context.User.FindFirst(c => c.Type == "permissions" && c.Value == requirement.Permission);
        
        if (permissionClaim != null)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission ?? throw new ArgumentNullException(nameof(permission));
    }
}