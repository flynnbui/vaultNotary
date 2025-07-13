using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.Services;

public interface ISearchService
{
    // Document search
    Task<List<DocumentDto>> SearchDocumentsAsync(string query);
    Task<List<DocumentDto>> SearchDocumentsByTransactionCodeAsync(string transactionCode);
    Task<List<DocumentDto>> SearchDocumentsByNotaryAsync(string notaryPublic);
    Task<List<DocumentDto>> SearchDocumentsBySecretaryAsync(string secretary);
    Task<List<DocumentDto>> SearchDocumentsByTypeAsync(string documentType);
    Task<List<DocumentDto>> SearchDocumentsByDateRangeAsync(DateTime from, DateTime to);
    
    // Customer search
    Task<List<CustomerDto>> SearchCustomersByIdentityAsync(string identity);
    Task<List<DocumentDto>> SearchDocumentsByCustomerAsync(string customerId);
    Task<List<DocumentDto>> SearchDocumentsByBusinessRegistrationAsync(string businessRegistrationNumber);
    Task<List<DocumentDto>> SearchDocumentsByPassportAsync(string passportId);
    Task<List<DocumentDto>> CrossReferenceSearchAsync(List<string> customerIds);
    
    // File search
    Task<List<DocumentFileDto>> SearchFilesByNameAsync(string fileName);
    Task<List<DocumentFileDto>> SearchFilesByContentTypeAsync(string contentType);
    Task<List<DocumentFileDto>> GetFilesByDocumentIdAsync(string documentId);
    
    // Relationship search
    Task<List<PartyDocumentLinkDto>> GetPartyDocumentLinksAsync(string documentId);
    Task<List<PartyDocumentLinkDto>> GetCustomerDocumentLinksAsync(string customerId);
    Task<List<DocumentFileLinkDto>> GetDocumentFileLinksAsync(string documentId);

    // Paginated search methods
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByTransactionCodePagedAsync(string transactionCode, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByNotaryPagedAsync(string notaryPublic, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsBySecretaryPagedAsync(string secretary, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByDateRangePagedAsync(DateTime from, DateTime to, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByCustomerPagedAsync(string customerId, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByBusinessRegistrationPagedAsync(string businessRegistrationNumber, int pageNumber, int pageSize);
    Task<PagedResultDto<DocumentDto>> SearchDocumentsByPassportPagedAsync(string passportId, int pageNumber, int pageSize);
    Task<PagedResultDto<CustomerDto>> SearchCustomersByIdentityPagedAsync(string identity, int pageNumber, int pageSize);
}