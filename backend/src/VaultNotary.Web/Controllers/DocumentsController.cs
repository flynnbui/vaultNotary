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
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IJobQueue _jobQueue;

    public DocumentsController(IDocumentService documentService, IJobQueue jobQueue)
    {
        _documentService = documentService;
        _jobQueue = jobQueue;
    }

    [HttpGet]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> GetAll()
    {
        var documents = await _documentService.GetAllAsync();
        return Ok(documents);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentDto>> GetById(string id)
    {
        var document = await _documentService.GetByIdAsync(id);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpGet("search")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> Search([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query))
            return BadRequest("Query parameter is required");

        var documents = await _documentService.SearchAsync(query);
        return Ok(documents);
    }

    [HttpGet("parties/{partyId}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> GetByPartyId(string partyId)
    {
        var documents = await _documentService.GetByPartyIdAsync(partyId);
        return Ok(documents);
    }

    [HttpPost]
    [HasPermission(Permissions.CreateDocuments)]
    public async Task<ActionResult<string>> Create([FromBody] CreateDocumentDto createDocumentDto)
    {
        var documentId = await _documentService.CreateAsync(createDocumentDto);
        return CreatedAtAction(nameof(GetById), new { id = documentId }, documentId);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateDocumentDto updateDocumentDto)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.UpdateAsync(id, updateDocumentDto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteDocuments)]
    public async Task<ActionResult> Delete(string id)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPut("{id}/parties")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> LinkParty(string id, [FromBody] LinkPartyRequest request)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.LinkPartyAsync(id, request.CustomerId, request.LinkDto);
        return NoContent();
    }

    [HttpDelete("{id}/parties/{customerId}")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> UnlinkParty(string id, string customerId)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.UnlinkPartyAsync(id, customerId);
        return NoContent();
    }

    [HttpPost("{documentId}/files")]
    [HasPermission(Permissions.UploadFiles)]
    public async Task<ActionResult<DocumentFileDto>> UploadFile(string documentId, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        if (string.IsNullOrEmpty(documentId))
            return BadRequest("Document ID is required");

        if (!await _documentService.ExistsAsync(documentId))
            return NotFound("Document not found");

        try
        {
            // Create a unique key for the file in S3
            var fileId = Guid.NewGuid().ToString();
            var s3Key = $"documents/{documentId}/{fileId}/{file.FileName}";
            
            // Create the DocumentFile DTO
            var createDocumentFileDto = new CreateDocumentFileDto
            {
                DocumentId = documentId,
                FileName = file.FileName,
                FileSize = file.Length,
                ContentType = file.ContentType,
                S3Key = s3Key,
                S3Bucket = "vault-notary-documents" // Should come from configuration
            };

            // Note: You'll need to implement DocumentFileService to handle this
            // For now, returning the expected structure
            var documentFile = new DocumentFileDto
            {
                Id = fileId,
                DocumentId = documentId,
                FileName = file.FileName,
                FileSize = file.Length,
                ContentType = file.ContentType,
                S3Key = s3Key,
                S3Bucket = "vault-notary-documents",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Publish CompressFileJob for PDF files
            if (file.ContentType == "application/pdf")
            {
                var compressJob = new CompressFileJob
                {
                    FileKey = s3Key,
                    DocumentId = documentId,
                    FileName = file.FileName
                };
                
                await _jobQueue.PublishAsync(compressJob);
            }

            return CreatedAtAction(nameof(GetFileById), new { documentId, fileId }, documentFile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while uploading the file: {ex.Message}");
        }
    }

    [HttpGet("{documentId}/files")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<List<DocumentFileDto>>> GetDocumentFiles(string documentId)
    {
        if (!await _documentService.ExistsAsync(documentId))
            return NotFound("Document not found");

        try
        {
            var document = await _documentService.GetByIdAsync(documentId);
            return Ok(document?.Files ?? new List<DocumentFileDto>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving files: {ex.Message}");
        }
    }

    [HttpGet("{documentId}/files/{fileId}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentFileDto>> GetFileById(string documentId, string fileId)
    {
        if (!await _documentService.ExistsAsync(documentId))
            return NotFound("Document not found");

        try
        {
            var document = await _documentService.GetByIdAsync(documentId);
            var file = document?.Files.FirstOrDefault(f => f.Id == fileId);
            
            if (file == null)
                return NotFound("File not found");

            return Ok(file);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving the file: {ex.Message}");
        }
    }

    [HttpDelete("{documentId}/files/{fileId}")]
    [HasPermission(Permissions.DeleteFiles)]
    public async Task<ActionResult> DeleteFile(string documentId, string fileId)
    {
        if (!await _documentService.ExistsAsync(documentId))
            return NotFound("Document not found");

        try
        {
            // Note: You'll need to implement DocumentFileService to handle this
            // For now, return success
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting the file: {ex.Message}");
        }
    }
}

public class LinkPartyRequest
{
    public string CustomerId { get; set; } = string.Empty;
    public CreatePartyDocumentLinkDto LinkDto { get; set; } = new();
}