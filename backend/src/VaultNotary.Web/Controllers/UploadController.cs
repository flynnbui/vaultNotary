using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Application.Validators;
using VaultNotary.Domain.Entities;
using VaultNotary.Infrastructure.Configuration;
using VaultNotary.Infrastructure.Jobs;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

public class FileUploadRequest
{
    public string DocumentId { get; set; } = string.Empty;
    public IFormFile File { get; set; } = null!;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly IDocumentService _documentService;
    private readonly IDocumentFileService _documentFileService;
    private readonly IJobQueue _jobQueue;
    private readonly AwsConfiguration _awsConfig;

    public UploadController(
        IFileService fileService,
        IDocumentService documentService,
        IDocumentFileService documentFileService,
        IJobQueue jobQueue,
        IOptions<AwsConfiguration> awsConfig)
    {
        _fileService = fileService;
        _documentService = documentService;
        _documentFileService = documentFileService;
        _jobQueue = jobQueue;
        _awsConfig = awsConfig.Value;
    }

    [HttpPost]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] FileUploadRequest request)
    {
        try
        {
            // Validate request
            if (request.File == null || request.File.Length == 0)
                return BadRequest("No file provided");

            if (string.IsNullOrWhiteSpace(request.DocumentId))
                return BadRequest("Document ID is required");

            // Validate document exists
            if (!await _documentService.ExistsAsync(request.DocumentId))
                return NotFound("Document not found");

            // Validate file type
            if (!AllowedFileTypes.IsValid(request.File.ContentType))
                return BadRequest($"Invalid file type. Allowed types: {AllowedFileTypes.GetAllowedTypesString()}");

            // Validate file size (50MB limit)
            const long maxFileSizeBytes = 50 * 1024 * 1024;
            if (request.File.Length > maxFileSizeBytes)
                return BadRequest("File size exceeds 50MB limit");

            // Upload to S3 using FileService
            using var stream = request.File.OpenReadStream();
            var uploadDto = new FileUploadDto
            {
                FileName = request.File.FileName,
                FileSize = request.File.Length,
                ContentType = request.File.ContentType,
                FileStream = stream
            };
            
            var s3Key = await _fileService.UploadAsync(uploadDto);
            var fileId = Guid.NewGuid().ToString();

            // Create database record
            var createDto = new CreateDocumentFileDto
            {
                DocumentId = request.DocumentId,
                FileName = request.File.FileName,
                FileSize = request.File.Length,
                ContentType = request.File.ContentType,
                S3Key = s3Key,
                S3Bucket = _awsConfig.S3.BucketName
            };

            var documentFileId = await _documentFileService.CreateAsync(createDto);

            // Trigger PDF compression job if needed
            if (AllowedFileTypes.IsPdf(request.File.ContentType))
            {
                var compressJob = new CompressFileJob
                {
                    FileKey = s3Key,
                    DocumentId = request.DocumentId,
                    FileName = request.File.FileName
                };
                
                await _jobQueue.PublishAsync(compressJob);
            }

            return Ok(new FileUploadResponse
            {
                Id = documentFileId,
                DocumentId = request.DocumentId,
                ContentType = request.File.ContentType,
                CreatedAt = DateTime.UtcNow,
                Message = "File uploaded successfully"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while uploading the file: {ex.Message}");
        }
    }

    [HttpGet("{fileId}/download")]
    [HasPermission(Permissions.DownloadFiles)]
    public async Task<ActionResult<FileDownloadResponse>> GetDownloadUrl(string fileId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileId))
                return BadRequest("File ID is required");

            // Get file metadata from database
            var file = await _documentFileService.GetByIdAsync(fileId);
            if (file == null)
                return NotFound("File not found");

            // Generate presigned URL for download
            var expirationTime = TimeSpan.FromHours(1);
            var presignedUrl = await _fileService.GetPresignedUrlAsync(file.S3Key, expirationTime);

            return Ok(new FileDownloadResponse
            {
                DownloadUrl = presignedUrl.Url,
                ExpiresAt = presignedUrl.ExpiresAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while generating download URL: {ex.Message}");
        }
    }

    [HttpGet("{fileId}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentFileDto>> GetFileMetadata(string fileId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileId))
                return BadRequest("File ID is required");

            var file = await _documentFileService.GetByIdAsync(fileId);
            if (file == null)
                return NotFound("File not found");

            return Ok(file);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving file metadata: {ex.Message}");
        }
    }

    [HttpDelete("{fileId}")]
    [HasPermission(Permissions.DeleteFiles)]
    public async Task<ActionResult> DeleteFile(string fileId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileId))
                return BadRequest("File ID is required");

            // Get file metadata
            var file = await _documentFileService.GetByIdAsync(fileId);
            if (file == null)
                return NotFound("File not found");

            // Delete from S3
            await _fileService.DeleteAsync(file.S3Key);

            // Delete from database
            await _documentFileService.DeleteAsync(fileId);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting the file: {ex.Message}");
        }
    }
}