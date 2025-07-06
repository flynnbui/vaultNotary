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

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
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
}

public class LinkPartyRequest
{
    public string CustomerId { get; set; } = string.Empty;
    public CreatePartyDocumentLinkDto LinkDto { get; set; } = new();
}