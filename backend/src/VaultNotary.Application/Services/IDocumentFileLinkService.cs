using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface IDocumentFileLinkService
{
    Task<DocumentFileLinkDto?> GetByIdAsync(string fileId, string documentId);
    Task<List<DocumentFileLinkDto>> GetByDocumentIdAsync(string documentId);
    Task<List<DocumentFileLinkDto>> GetByFileIdAsync(string fileId);
    Task<List<DocumentFileLinkDto>> GetAllAsync();
    Task CreateAsync(CreateDocumentFileLinkDto createDto);
    Task DeleteAsync(string fileId, string documentId);
    Task<bool> ExistsAsync(string fileId, string documentId);
}