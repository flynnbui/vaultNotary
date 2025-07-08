using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using VaultNotary.Application;
using VaultNotary.Application.Services;
using VaultNotary.Infrastructure;
using VaultNotary.Infrastructure.Data;
using VaultNotary.Web.Authorization;
using VaultNotary.Web.Configuration;
using VaultNotary.Web.Middleware;
using VaultNotary.Web;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Auth0 - Skip in Testing and Test environments
if (!builder.Environment.IsEnvironment("Testing") && !builder.Environment.IsEnvironment("Test"))
{
    builder.Services.Configure<Auth0Configuration>(builder.Configuration.GetSection("Auth0"));
    var auth0Config = builder.Configuration.GetSection("Auth0").Get<Auth0Configuration>() ?? new Auth0Configuration();

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = $"https://{auth0Config.Domain}/";
            options.Audience = auth0Config.Audience;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                NameClaimType = ClaimTypes.NameIdentifier
            };
        });
}
else
{
    // For testing, use a simple authentication scheme
    builder.Services.AddAuthentication("Test")
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthenticationScheme>("Test", options => {});
}

// Configure Authorization
if (builder.Environment.IsEnvironment("Testing") || builder.Environment.IsEnvironment("Test"))
{
    // For testing, allow all requests
    builder.Services.AddAuthorization(options =>
    {
        options.DefaultPolicy = new AuthorizationPolicyBuilder()
            .RequireAssertion(_ => true)
            .Build();
        options.FallbackPolicy = options.DefaultPolicy;
        // Register all permission and role policies as no-op
        options.AddPolicy(Permissions.ReadCustomers, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.CreateCustomers, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.UpdateCustomers, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.DeleteCustomers, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Permissions.ReadDocuments, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.CreateDocuments, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.UpdateDocuments, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.DeleteDocuments, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Permissions.UploadFiles, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.DownloadFiles, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.DeleteFiles, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Permissions.SearchDocuments, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.SearchCustomers, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Permissions.VerifyDocuments, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Permissions.SignDocuments, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Permissions.AdminAccess, p => p.RequireAssertion(_ => true));

        options.AddPolicy(Roles.Admin, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Roles.NotaryPublic, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Roles.User, p => p.RequireAssertion(_ => true));
        options.AddPolicy(Roles.Viewer, p => p.RequireAssertion(_ => true));
    });
}
else
{
    builder.Services.AddAuthorization(options =>
    {
        // Permission-based policies
        options.AddPolicy(Permissions.ReadCustomers, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.ReadCustomers)));
        options.AddPolicy(Permissions.CreateCustomers, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.CreateCustomers)));
        options.AddPolicy(Permissions.UpdateCustomers, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.UpdateCustomers)));
        options.AddPolicy(Permissions.DeleteCustomers, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.DeleteCustomers)));
        
        options.AddPolicy(Permissions.ReadDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.ReadDocuments)));
        options.AddPolicy(Permissions.CreateDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.CreateDocuments)));
        options.AddPolicy(Permissions.UpdateDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.UpdateDocuments)));
        options.AddPolicy(Permissions.DeleteDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.DeleteDocuments)));
        
        options.AddPolicy(Permissions.UploadFiles, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.UploadFiles)));
        options.AddPolicy(Permissions.DownloadFiles, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.DownloadFiles)));
        options.AddPolicy(Permissions.DeleteFiles, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.DeleteFiles)));
        
        options.AddPolicy(Permissions.SearchDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.SearchDocuments)));
        options.AddPolicy(Permissions.SearchCustomers, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.SearchCustomers)));
        
        options.AddPolicy(Permissions.VerifyDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.VerifyDocuments)));
        options.AddPolicy(Permissions.SignDocuments, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.SignDocuments)));
        
        options.AddPolicy(Permissions.AdminAccess, policy => 
            policy.Requirements.Add(new PermissionRequirement(Permissions.AdminAccess)));
        
        // Role-based policies
        options.AddPolicy(Roles.Admin, policy => policy.RequireRole(Roles.Admin));
        options.AddPolicy(Roles.NotaryPublic, policy => policy.RequireRole(Roles.NotaryPublic));
        options.AddPolicy(Roles.User, policy => policy.RequireRole(Roles.User));
        options.AddPolicy(Roles.Viewer, policy => policy.RequireRole(Roles.Viewer));
    });
    
    builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
}

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAuth0", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000") // React app
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<VaultNotaryDbContext>();
    
    try
    {
        // Ensure database is created and apply any pending migrations
        dbContext.Database.EnsureCreated();
        app.Logger.LogInformation("Database initialized successfully");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while initializing the database");
        throw;
    }
}

// Configure Serilog request logging
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Test"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("AllowAuth0");

app.UseAuthentication();
app.UseMiddleware<Auth0PermissionsMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
