using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;
using VaultNotary.Infrastructure.Jobs;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly IJobQueue _jobQueue;

    public UploadController(IFileService fileService, IJobQueue jobQueue)
    {
        _fileService = fileService;
        _jobQueue = jobQueue;
    }

    [HttpPost("single")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<string>> UploadSingle(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        using var stream = file.OpenReadStream();
        var fileUploadDto = new FileUploadDto
        {
            FileName = file.FileName,
            FileSize = file.Length,
            ContentType = file.ContentType,
            FileStream = stream
        };

        var fileKey = await _fileService.UploadAsync(fileUploadDto);
        
        // Publish CompressFileJob for PDF files
        if (file.ContentType == "application/pdf")
        {
            var compressJob = new CompressFileJob
            {
                FileKey = fileKey,
                DocumentId = "", // Will be populated when linked to document
                FileName = file.FileName
            };
            
            await _jobQueue.PublishAsync(compressJob);
        }
        
        return Ok(new { fileKey });
    }

    [HttpPost("initiate")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<MultipartUploadInitiateResponseDto>> InitiateMultipartUpload([FromBody] MultipartUploadInitiateDto initiateDto)
    {
        var response = await _fileService.InitiateMultipartUploadAsync(initiateDto);
        return Ok(response);
    }

    [HttpPut("{key}/part/{partNumber}")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<MultipartUploadPartResponseDto>> UploadPart(
        string key, 
        int partNumber, 
        [FromQuery] string uploadId,
        [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file part provided");

        using var stream = file.OpenReadStream();
        var partDto = new MultipartUploadPartDto
        {
            Key = key,
            UploadId = uploadId,
            PartNumber = partNumber,
            PartStream = stream
        };

        var response = await _fileService.UploadPartAsync(partDto);
        return Ok(response);
    }

    [HttpPost("{key}/complete")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<string>> CompleteMultipartUpload(
        string key,
        [FromBody] CompleteMultipartUploadRequest request)
    {
        var completeDto = new MultipartUploadCompleteDto
        {
            Key = key,
            UploadId = request.UploadId,
            PartETags = request.PartETags
        };

        var etag = await _fileService.CompleteMultipartUploadAsync(completeDto);
        return Ok(new { etag });
    }

    [HttpDelete("{key}")]
    [HasPermission(Permissions.DeleteFiles)]
    public async Task<ActionResult> AbortMultipartUpload(string key, [FromQuery] string uploadId)
    {
        await _fileService.AbortMultipartUploadAsync(key, uploadId);
        return NoContent();
    }

    [HttpPost("{key}/hash")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<string>> ComputeHash(string key, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        using var stream = file.OpenReadStream();
        var hash = await _fileService.ComputeHashAsync(stream);
        return Ok(new { hash });
    }

    [HttpPost("{key}/verify")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<bool>> VerifyHash(string key, [FromQuery] string hash, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        if (string.IsNullOrEmpty(hash))
            return BadRequest("Hash parameter is required");

        using var stream = file.OpenReadStream();
        var isValid = await _fileService.VerifyHashAsync(hash, stream);
        return Ok(new { isValid });
    }
}

public class CompleteMultipartUploadRequest
{
    public string UploadId { get; set; } = string.Empty;
    public List<string> PartETags { get; set; } = new();
}