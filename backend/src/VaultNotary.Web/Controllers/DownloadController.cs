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
    private readonly IFileService _fileService;

    public DownloadController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet("{fileId}")]
    [HasPermission(Permissions.DownloadFiles)]
    public async Task<ActionResult> Download(string fileId)
    {
        if (!await _fileService.ExistsAsync(fileId))
            return NotFound();

        var stream = await _fileService.DownloadAsync(fileId);
        return File(stream, "application/octet-stream", fileId);
    }

    [HttpGet("{fileId}/presigned")]
    [HasPermission(Permissions.DownloadFiles)]
    public async Task<ActionResult<PresignedUrlDto>> GetPresignedUrl(string fileId, [FromQuery] int expirationHours = 24)
    {
        if (!await _fileService.ExistsAsync(fileId))
            return NotFound();

        var expiration = TimeSpan.FromHours(expirationHours);
        var presignedUrl = await _fileService.GetPresignedUrlAsync(fileId, expiration);
        return Ok(presignedUrl);
    }
}