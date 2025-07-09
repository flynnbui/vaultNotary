using VaultNotary.BackgroundJobs;
using VaultNotary.BackgroundJobs.Services;
using VaultNotary.Infrastructure.Jobs;
using VaultNotary.Infrastructure.Repositories;
using VaultNotary.Infrastructure;
using VaultNotary.Domain.Repositories;
using VaultNotary.Application.Services;

var builder = Host.CreateApplicationBuilder(args);

// Add infrastructure services
builder.Services.AddInfrastructure(builder.Configuration);

// Add services
builder.Services.AddSingleton<IJobQueue, RabbitMqJobQueue>();
builder.Services.AddSingleton<IPdfCompressionService, PdfCompressionService>();
builder.Services.AddHostedService<PdfCompressionWorker>();

// Add logging
builder.Services.AddLogging();

var host = builder.Build();

await host.RunAsync();