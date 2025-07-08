using Microsoft.Extensions.DependencyInjection;
using VaultNotary.Application.Services;

namespace VaultNotary.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register application services
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<ISearchService, SearchService>();
        
        return services;
    }
}