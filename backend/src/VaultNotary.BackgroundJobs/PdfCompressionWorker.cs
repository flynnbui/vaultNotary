using VaultNotary.BackgroundJobs.Services;
using VaultNotary.Infrastructure.Jobs;
using VaultNotary.Infrastructure.Repositories;
using VaultNotary.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace VaultNotary.BackgroundJobs;

public class PdfCompressionWorker : BackgroundService
{
    private readonly ILogger<PdfCompressionWorker> _logger;
    private readonly IJobQueue _jobQueue;
    private readonly IFileRepository _s3FileRepository;
    private readonly IPdfCompressionService _pdfCompressionService;

    public PdfCompressionWorker(
        ILogger<PdfCompressionWorker> logger,
        IJobQueue jobQueue,
        IFileRepository s3FileRepository,
        IPdfCompressionService pdfCompressionService)
    {
        _logger = logger;
        _jobQueue = jobQueue;
        _s3FileRepository = s3FileRepository;
        _pdfCompressionService = pdfCompressionService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PDF Compression Worker started");

        await _jobQueue.StartConsumingAsync<CompressFileJob>(
            "vaultnotary.compressfilejob",
            ProcessCompressFileJob,
            stoppingToken);
    }

    private async Task ProcessCompressFileJob(CompressFileJob job)
    {
        try
        {
            _logger.LogInformation("Processing PDF compression job for file: {FileKey}", job.FileKey);

            // Download the file from S3
            var fileStream = await _s3FileRepository.DownloadAsync(job.FileKey);
            using var memoryStream = new MemoryStream();
            await fileStream.CopyToAsync(memoryStream);
            var fileData = memoryStream.ToArray();
            
            if (fileData.Length == 0)
            {
                _logger.LogWarning("File is empty in S3: {FileKey}", job.FileKey);
                return;
            }

            // Compress the PDF
            var compressedData = await _pdfCompressionService.CompressPdfAsync(fileData);

            // Upload the compressed version back to S3 with the same key
            using var compressedStream = new MemoryStream(compressedData);
            await _s3FileRepository.UploadAsync(job.FileKey, compressedStream, "application/pdf");

            _logger.LogInformation("Successfully compressed PDF: {FileKey}, Original size: {OriginalSize}, Compressed size: {CompressedSize}",
                job.FileKey, fileData.Length, compressedData.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process PDF compression job for file: {FileKey}", job.FileKey);
            throw;
        }
    }
}