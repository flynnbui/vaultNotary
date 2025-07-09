using VaultNotary.Domain.Entities;

namespace VaultNotary.Domain.Repositories;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(string id);
    Task<Document?> GetByHashAsync(string sha256Hash);
    Task<List<Document>> GetByCustomerIdAsync(string customerId);
    Task<List<Document>> SearchAsync(string query);
    Task<List<Document>> GetByNotaryDateRangeAsync(DateTime from, DateTime to);
    Task<List<Document>> GetAllAsync();
    Task<List<Document>> GetAllDocumentsAsync();
    Task<List<Document>> GetAllDocumentsAsync(int skip, int take);
    Task<int> GetTotalCountAsync();
    Task<string> CreateAsync(Document document);
    Task UpdateAsync(Document document);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}