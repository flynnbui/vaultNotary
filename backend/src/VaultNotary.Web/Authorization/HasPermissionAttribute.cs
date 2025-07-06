using Microsoft.AspNetCore.Authorization;

namespace VaultNotary.Web.Authorization;

public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission) : base(permission)
    {
    }
}

public class HasRoleAttribute : AuthorizeAttribute
{
    public HasRoleAttribute(string role) : base(policy: role)
    {
        Roles = role;
    }
}