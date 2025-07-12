using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface IDocumentFileService
{
    Task<DocumentFileDto?> GetByIdAsync(string id);
    Task<List<DocumentFileDto>> GetByDocumentIdAsync(string documentId);
    Task<List<DocumentFileDto>> GetAllAsync();
    Task<string> CreateAsync(CreateDocumentFileDto createDocumentFileDto);
    Task UpdateAsync(string id, UpdateDocumentFileDto updateDocumentFileDto);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<bool> ValidateIntegrityAsync(string id);
    Task<string> GeneratePresignedUrlAsync(string id, TimeSpan expiration);
}