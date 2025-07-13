using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.Services;

public interface IDocumentService
{
    Task<DocumentDto?> GetByIdAsync(string id);
    Task<DocumentDto?> GetByTransactionCodeAsync(string transactionCode);
    Task<List<DocumentDto>> GetByCustomerIdAsync(string customerId);
    Task<List<DocumentDto>> SearchAsync(string query);
    Task<List<DocumentDto>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<List<DocumentDto>> GetByNotaryAsync(string notaryPublic);
    Task<List<DocumentDto>> GetBySecretaryAsync(string secretary);
    Task<List<DocumentDto>> GetByDocumentTypeAsync(string documentType);
    Task<List<DocumentListDto>> GetAllAsync();
    Task<PaginatedResult<DocumentListDto>> GetAllDocumentsAsync(int pageNumber = 1, int pageSize = 10);
    Task<string> CreateAsync(CreateDocumentDto createDocumentDto);
    Task UpdateAsync(string id, UpdateDocumentDto updateDocumentDto);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task LinkPartyAsync(string documentId, CreatePartyDocumentLinkDto linkDto);
    Task UnlinkPartyAsync(string documentId, string customerId);
    Task<List<DocumentDto>> GetByPartyIdAsync(string partyId);
}