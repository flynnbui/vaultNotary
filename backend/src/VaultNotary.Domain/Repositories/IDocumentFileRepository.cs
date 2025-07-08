using VaultNotary.Domain.Entities;

namespace VaultNotary.Domain.Repositories;

public interface IDocumentFileRepository
{
    Task<DocumentFile?> GetByIdAsync(string id);
    Task<List<DocumentFile>> GetByDocumentIdAsync(string documentId);
    Task<DocumentFile?> GetByS3KeyAsync(string s3Key);
    Task<List<DocumentFile>> SearchByFileNameAsync(string fileName);
    Task<List<DocumentFile>> GetAllAsync();
    Task<string> CreateAsync(DocumentFile documentFile);
    Task UpdateAsync(DocumentFile documentFile);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<bool> ExistsByS3KeyAsync(string s3Key);
}