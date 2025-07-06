using Amazon.DynamoDBv2;
using Amazon.KeyManagementService;
using Amazon.S3;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VaultNotary.Domain.Repositories;
using VaultNotary.Domain.Services;
using VaultNotary.Infrastructure.Configuration;
using VaultNotary.Infrastructure.Repositories;
using VaultNotary.Infrastructure.Services;

namespace VaultNotary.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AwsConfiguration>(configuration.GetSection("Aws"));

        services.AddSingleton<IAmazonDynamoDB, AmazonDynamoDBClient>();
        services.AddSingleton<IAmazonS3, AmazonS3Client>();
        services.AddSingleton<IAmazonKeyManagementService, AmazonKeyManagementServiceClient>();

        services.AddScoped<ICustomerRepository, DynamoDbCustomerRepository>();
        services.AddScoped<IFileRepository, S3FileRepository>();
        services.AddScoped<IHashService, HashService>();
        services.AddScoped<ISignatureService, KmsSignatureService>();

        return services;
    }
}