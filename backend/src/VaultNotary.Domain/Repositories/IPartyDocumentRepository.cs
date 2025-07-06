using VaultNotary.Domain.Entities;

namespace VaultNotary.Domain.Repositories;

public interface IPartyDocumentRepository
{
    Task<List<PartyDocumentLink>> GetByDocumentIdAsync(string documentId);
    Task<List<PartyDocumentLink>> GetByCustomerIdAsync(string customerId);
    Task<PartyDocumentLink?> GetByDocumentAndCustomerAsync(string documentId, string customerId);
    Task<List<PartyDocumentLink>> GetByRoleAsync(PartyRole role);
    Task<List<PartyDocumentLink>> CrossReferenceSearchAsync(List<string> customerIds);
    Task CreateAsync(PartyDocumentLink link);
    Task UpdateAsync(PartyDocumentLink link);
    Task DeleteAsync(string documentId, string customerId);
    Task<bool> ExistsAsync(string documentId, string customerId);
}