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
        // Convert CreateFileDto to CreateDocumentDto
        var createDocumentDto = new CreateDocumentDto
        {
            FileName = createFileDto.MaGiaoDich,
            FileSize = 0, // Will be updated during file upload
            ContentType = "application/pdf", // Default, will be updated during file upload
            NotaryPublic = createFileDto.CongChungVien,
            DocumentType = MapLoaiHoSoToDocumentType(createFileDto.LoaiHoSo),
            NotaryDate = createFileDto.NgayTao
        };

        var documentId = await _documentService.CreateAsync(createDocumentDto);
        
        // Link parties to the document
        await LinkPartiesToDocument(documentId, createFileDto.Parties);

        return Ok(new { id = documentId });
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ReadDocuments)]
    public async Task<ActionResult<DocumentDto>> GetFile(string id)
    {
        var document = await _documentService.GetByIdAsync(id);
        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateDocuments)]
    public async Task<ActionResult> UpdateFile(string id, [FromBody] CreateFileDto updateFileDto)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        var updateDocumentDto = new UpdateDocumentDto
        {
            FileName = updateFileDto.MaGiaoDich,
            NotaryPublic = updateFileDto.CongChungVien,
            DocumentType = MapLoaiHoSoToDocumentType(updateFileDto.LoaiHoSo),
            NotaryDate = updateFileDto.NgayTao
        };

        await _documentService.UpdateAsync(id, updateDocumentDto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteDocuments)]
    public async Task<ActionResult> DeleteFile(string id)
    {
        if (!await _documentService.ExistsAsync(id))
            return NotFound();

        await _documentService.DeleteAsync(id);
        return NoContent();
    }

    private async Task LinkPartiesToDocument(string documentId, PartiesDto parties)
    {
        // Link party A members
        foreach (var member in parties.A)
        {
            var linkDto = new CreatePartyDocumentLinkDto
            {
                DocumentId = documentId,
                CustomerId = member.Id,
                PartyRole = PartyRole.PartyA,
                NotaryDate = DateTime.UtcNow
            };
            await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
        }

        // Link party B members
        foreach (var member in parties.B)
        {
            var linkDto = new CreatePartyDocumentLinkDto
            {
                DocumentId = documentId,
                CustomerId = member.Id,
                PartyRole = PartyRole.PartyB,
                NotaryDate = DateTime.UtcNow
            };
            await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
        }

        // Link party C members if present
        if (parties.C != null)
        {
            foreach (var member in parties.C)
            {
                var linkDto = new CreatePartyDocumentLinkDto
                {
                    DocumentId = documentId,
                    CustomerId = member.Id,
                    PartyRole = PartyRole.Witness,
                    NotaryDate = DateTime.UtcNow
                };
                await _documentService.LinkPartyAsync(documentId, member.Id, linkDto);
            }
        }
    }

    private static VaultNotary.Domain.Entities.DocumentType MapLoaiHoSoToDocumentType(string loaiHoSo)
    {
        return loaiHoSo.ToLower() switch
        {
            "hop dong" => VaultNotary.Domain.Entities.DocumentType.Contract,
            "chung thuc" => VaultNotary.Domain.Entities.DocumentType.Certificate,
            "uy quyen" => VaultNotary.Domain.Entities.DocumentType.Agreement,
            _ => VaultNotary.Domain.Entities.DocumentType.Other
        };
    }
}