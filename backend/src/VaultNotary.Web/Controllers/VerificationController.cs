using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VerificationController : ControllerBase
{
    private readonly IVerificationService _verificationService;

    public VerificationController(IVerificationService verificationService)
    {
        _verificationService = verificationService;
    }

    [HttpGet("{fileId}")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<DocumentDto>> GetVerificationInfo(string fileId)
    {
        var document = await _verificationService.GetDocumentVerificationInfoAsync(fileId);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpPost("batch")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> BatchVerify([FromBody] List<string> documentIds)
    {
        if (documentIds == null || !documentIds.Any())
            return BadRequest("Document IDs are required");

        var documents = await _verificationService.BatchVerifyDocumentsAsync(documentIds);
        return Ok(documents);
    }

    [HttpPost("{documentId}/sign")]
    [HasPermission(Permissions.SignDocuments)]
    public async Task<ActionResult<string>> SignDocument(string documentId, [FromBody] SignDocumentRequest request)
    {
        var signature = await _verificationService.SignDocumentHashAsync(documentId, request.Hash);
        return Ok(new { signature });
    }

    [HttpPost("{documentId}/verify")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<bool>> VerifySignature(string documentId, [FromBody] VerifySignatureRequest request)
    {
        var isValid = await _verificationService.VerifyDocumentSignatureAsync(documentId, request.Hash, request.Signature);
        return Ok(new { isValid });
    }

    [HttpPost("{documentId}/integrity")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<bool>> VerifyIntegrity(string documentId, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        using var stream = file.OpenReadStream();
        var isValid = await _verificationService.VerifyDocumentIntegrityAsync(documentId, stream);
        return Ok(new { isValid });
    }

    [HttpGet("public-key")]
    [HasPermission(Permissions.VerifyDocuments)]
    public async Task<ActionResult<string>> GetPublicKey()
    {
        var publicKey = await _verificationService.GetPublicKeyAsync();
        return Ok(new { publicKey });
    }
}

public class SignDocumentRequest
{
    public string Hash { get; set; } = string.Empty;
}

public class VerifySignatureRequest
{
    public string Hash { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
}