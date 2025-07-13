using VaultNotary.Domain.Entities;

namespace VaultNotary.Domain.Repositories;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(string id);
    Task<Document?> GetByIdWithFilesAsync(string id);
    Task<Document?> GetByHashAsync(string sha256Hash);
    Task<List<Document>> GetByCustomerIdAsync(string customerId);
    Task<List<Document>> SearchAsync(string query);
    Task<List<Document>> GetByNotaryDateRangeAsync(DateTime from, DateTime to);
    Task<(List<Document> Documents, int TotalCount)> GetPagedAsync(int skip, int take, string? searchTerm = null);
    Task<int> GetTotalCountAsync();
    
    // Optimized specific queries
    Task<Document?> GetByTransactionCodeAsync(string transactionCode);
    Task<List<Document>> GetByNotaryPublicAsync(string notaryPublic);
    Task<List<Document>> GetBySecretaryAsync(string secretary);
    Task<List<Document>> GetByDocumentTypeAsync(string documentType);
    
    Task<string> CreateAsync(Document document);
    Task UpdateAsync(Document document);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}