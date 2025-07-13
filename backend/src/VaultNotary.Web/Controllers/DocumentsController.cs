using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IDocumentFileService _documentFileService;

    public DocumentsController(
        IDocumentService documentService,
        IDocumentFileService documentFileService)
    {
        _documentService = documentService;
        _documentFileService = documentFileService;
    }

    [HttpGet]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<PaginatedResult<DocumentListDto>>> GetAll([FromQuery] int limit = 50)
    {
        // Safety limit to prevent loading too many documents
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 50;
        
        var result = await _documentService.GetAllDocumentsAsync(1, limit);
        return Ok(result);
    }

    [HttpGet("paginated")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<PaginatedResult<DocumentListDto>>> GetAllPaginated(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await _documentService.GetAllDocumentsAsync(pageNumber, pageSize, searchTerm);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentDto>> GetById(string id)
    {
        var document = await _documentService.GetByIdAsync(id);
        if (document == null)
            return NotFound("Document not found");
        return Ok(document);
    }


    [HttpGet("{id}/files")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<List<DocumentFileDto>>> GetDocumentFiles(string id)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound("Document not found");

        var files = await _documentFileService.GetByDocumentIdAsync(id);
        return Ok(files);
    }



    [HttpPost]
    [HasPermission(Permissions.CreateDocuments)]
    public async Task<ActionResult<string>> Create([FromBody] CreateDocumentDto createDocumentDto)
    {
        if (!ModelState.IsValid)
        {
            var errorMessages = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
            var fullErrorMessage = "Dữ liệu gửi lên không hợp lệ: " + string.Join("; ", errorMessages);
            return BadRequest(fullErrorMessage);
        }
        var documentId = await _documentService.CreateAsync(createDocumentDto);
        return CreatedAtAction(nameof(GetById), new { id = documentId }, documentId);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateDocumentDto updateDocumentDto)
    {
        if (!ModelState.IsValid)
        {
            var errorMessages = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
            var fullErrorMessage = "Dữ liệu gửi lên không hợp lệ: " + string.Join("; ", errorMessages);
            return BadRequest(fullErrorMessage);
        }
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
    public async Task<ActionResult> LinkParty(string id, [FromBody] CreatePartyDocumentLinkDto request)
    {
        if (!ModelState.IsValid)
        {
            var errorMessages = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
            var fullErrorMessage = "Dữ liệu gửi lên không hợp lệ: " + string.Join("; ", errorMessages);
            return BadRequest(fullErrorMessage);
        }
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.LinkPartyAsync(id, request);
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

}

