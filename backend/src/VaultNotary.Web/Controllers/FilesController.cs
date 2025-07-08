using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Domain.Entities;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public FilesController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost]
    [HasPermission(Permissions.CreateDocuments)]
    public async Task<ActionResult<string>> CreateFile([FromBody] CreateFileDto createFileDto)
    {
        if (createFileDto == null)
            return BadRequest("CreateFileDto cannot be null");

        if (string.IsNullOrWhiteSpace(createFileDto.TransactionCode))
            return BadRequest("TransactionCode is required");

        if (string.IsNullOrWhiteSpace(createFileDto.DocumentType))
            return BadRequest("DocumentType is required");

        try
        {
            var createDocumentDto = new CreateDocumentDto
            {
                CreatedDate = createFileDto.CreatedDate,
                Secretary = createFileDto.Secretary,
                NotaryPublic = createFileDto.NotaryPublic,
                TransactionCode = createFileDto.TransactionCode,
                Description = createFileDto.Description,
                DocumentType = createFileDto.DocumentType,
                Parties = new List<PartyDocumentLinkDto>()
            };

            var documentId = await _documentService.CreateAsync(createDocumentDto);
            
            // Link parties to the document
            await LinkPartiesToDocument(documentId, createFileDto.Parties);

            return Ok(new { id = documentId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while creating the file: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentDto>> GetFile(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Document ID is required");

        try
        {
            var document = await _documentService.GetByIdAsync(id);
            if (document == null)
                return NotFound($"Document with ID '{id}' not found");

            return Ok(document);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while retrieving the file: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> UpdateFile(string id, [FromBody] CreateFileDto updateFileDto)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Document ID is required");

        if (updateFileDto == null)
            return BadRequest("UpdateFileDto cannot be null");

        if (string.IsNullOrWhiteSpace(updateFileDto.TransactionCode))
            return BadRequest("TransactionCode is required");

        if (string.IsNullOrWhiteSpace(updateFileDto.DocumentType))
            return BadRequest("DocumentType is required");

        try
        {
            if (!await _documentService.ExistsAsync(id))
                return NotFound($"Document with ID '{id}' not found");

            var updateDocumentDto = new UpdateDocumentDto
            {
                CreatedDate = updateFileDto.CreatedDate,
                Secretary = updateFileDto.Secretary,
                NotaryPublic = updateFileDto.NotaryPublic,
                TransactionCode = updateFileDto.TransactionCode,
                Description = updateFileDto.Description,
                DocumentType = updateFileDto.DocumentType
            };

            await _documentService.UpdateAsync(id, updateDocumentDto);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while updating the file: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteDocuments)]
    public async Task<ActionResult> DeleteFile(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Document ID is required");

        try
        {
            if (!await _documentService.ExistsAsync(id))
                return NotFound($"Document with ID '{id}' not found");

            await _documentService.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while deleting the file: {ex.Message}");
        }
    }

    private async Task LinkPartiesToDocument(string documentId, PartiesDto parties)
    {
        if (parties == null) return;

        // Link party A members
        if (parties.A != null)
        {
            foreach (var member in parties.A)
            {
                if (string.IsNullOrWhiteSpace(member.Id)) continue;
                
                var linkDto = new CreatePartyDocumentLinkDto
                {
                    CustomerId = member.Id,
                    PartyRole = PartyRole.PartyA,
                    SignatureStatus = SignatureStatus.Pending,
                    NotaryDate = member.NotaryDate == default ? DateTime.UtcNow : member.NotaryDate
                };
                await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
            }
        }

        // Link party B members
        if (parties.B != null)
        {
            foreach (var member in parties.B)
            {
                if (string.IsNullOrWhiteSpace(member.Id)) continue;
                
                var linkDto = new CreatePartyDocumentLinkDto
                {
                    CustomerId = member.Id,
                    PartyRole = PartyRole.PartyB,
                    SignatureStatus = SignatureStatus.Pending,
                    NotaryDate = member.NotaryDate == default ? DateTime.UtcNow : member.NotaryDate
                };
                await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
            }
        }

        // Link party C members if present
        if (parties.C != null)
        {
            foreach (var member in parties.C)
            {
                if (string.IsNullOrWhiteSpace(member.Id)) continue;
                
                var linkDto = new CreatePartyDocumentLinkDto
                {
                    CustomerId = member.Id,
                    PartyRole = PartyRole.Witness,
                    SignatureStatus = SignatureStatus.Pending,
                    NotaryDate = member.NotaryDate == default ? DateTime.UtcNow : member.NotaryDate
                };
                await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
            }
        }
    }

}