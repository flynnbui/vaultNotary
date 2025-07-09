using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DownloadController : ControllerBase
{
    private readonly IDocumentFileService _documentFileService;
    private readonly IFileService _fileService;

    public DownloadController(IDocumentFileService documentFileService, IFileService fileService)
    {
        _documentFileService = documentFileService;
        _fileService = fileService;
    }

    [HttpGet("{fileId}")]
    [HasPermission(Permissions.DownloadFiles)]
    public async Task<ActionResult> Download(string fileId)
    {
        var documentFile = await _documentFileService.GetByIdAsync(fileId);
        if (documentFile == null)
            return NotFound();

        var stream = await _fileService.DownloadAsync(documentFile.S3Key);
        return File(stream, documentFile.ContentType, documentFile.FileName);
    }

    [HttpGet("{fileId}/presigned")]
    [HasPermission(Permissions.DownloadFiles)]
    public async Task<ActionResult<PresignedUrlDto>> GetPresignedUrl(string fileId, [FromQuery] int expirationHours = 24)
    {
        var documentFile = await _documentFileService.GetByIdAsync(fileId);
        if (documentFile == null)
            return NotFound();

        var expiration = TimeSpan.FromHours(expirationHours);
        var presignedUrl = await _fileService.GetPresignedUrlAsync(documentFile.S3Key, expiration);
        return Ok(presignedUrl);
    }
}