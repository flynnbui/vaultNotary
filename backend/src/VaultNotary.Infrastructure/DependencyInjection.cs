using Amazon.KeyManagementService;
using Amazon.S3;
using Amazon;
using Amazon.Runtime;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Repositories;
using VaultNotary.Domain.Services;
using VaultNotary.Infrastructure.Configuration;
using VaultNotary.Infrastructure.Data;
using VaultNotary.Infrastructure.Repositories;
using VaultNotary.Infrastructure.Services;
using VaultNotary.Infrastructure.Jobs;

namespace VaultNotary.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AwsConfiguration>(configuration.GetSection("Aws"));

        // Configure PostgreSQL Entity Framework with snake_case naming
        services.AddDbContext<VaultNotaryDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention());

        // Configure AWS clients with flexible authentication
        services.AddSingleton<IAmazonS3>(provider =>
        {
            var awsConfig = configuration.GetSection("Aws").Get<AwsConfiguration>();
            var config = new AmazonS3Config 
            { 
                RegionEndpoint = RegionEndpoint.GetBySystemName(awsConfig?.Region ?? "us-east-1")
            };

            // Use IAM role if UseIamRole is true or no credentials provided
            if (awsConfig?.UseIamRole == true || string.IsNullOrEmpty(awsConfig?.AccessKey))
            {
                // Use default credential chain (IAM role, instance profile, environment variables)
                return new AmazonS3Client(config);
            }
            else
            {
                // Use provided credentials for development
                var credentials = new BasicAWSCredentials(awsConfig.AccessKey, awsConfig.SecretKey);
                return new AmazonS3Client(credentials, config);
            }
        });

        services.AddSingleton<IAmazonKeyManagementService>(provider =>
        {
            var awsConfig = configuration.GetSection("Aws").Get<AwsConfiguration>();
            var config = new AmazonKeyManagementServiceConfig 
            { 
                RegionEndpoint = RegionEndpoint.GetBySystemName(awsConfig?.Region ?? "us-east-1")
            };

            // Use IAM role if UseIamRole is true or no credentials provided
            if (awsConfig?.UseIamRole == true || string.IsNullOrEmpty(awsConfig?.AccessKey))
            {
                // Use default credential chain (IAM role, instance profile, environment variables)
                return new AmazonKeyManagementServiceClient(config);
            }
            else
            {
                // Use provided credentials for development
                var credentials = new BasicAWSCredentials(awsConfig.AccessKey, awsConfig.SecretKey);
                return new AmazonKeyManagementServiceClient(credentials, config);
            }
        });

        // Register Entity Framework repositories
        services.AddScoped<ICustomerRepository, EfCustomerRepository>();
        services.AddScoped<IDocumentRepository, EfDocumentRepository>();
        services.AddScoped<IPartyDocumentRepository, EfPartyDocumentRepository>();
        services.AddScoped<IDocumentFileRepository, EfDocumentFileRepository>();
        services.AddScoped<IFileRepository, S3FileRepository>();
        
        // Register services
        services.AddScoped<IHashService, HashService>();
        services.AddScoped<ISignatureService, KmsSignatureService>();
        services.AddSingleton<IJobQueue, RabbitMqJobQueue>();

        return services;
    }
}