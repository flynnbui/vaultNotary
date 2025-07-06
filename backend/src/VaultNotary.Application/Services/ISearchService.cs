using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface ISearchService
{
    Task<List<CustomerDto>> SearchCustomersByIdentityAsync(string identity);
    Task<List<DocumentDto>> SearchDocumentsAsync(string query);
    Task<List<DocumentDto>> SearchDocumentsByCustomerAsync(string customerId);
    Task<List<DocumentDto>> SearchDocumentsByBusinessRegistrationAsync(string businessRegistrationNumber);
    Task<List<DocumentDto>> SearchDocumentsByPassportAsync(string passportId);
    Task<List<DocumentDto>> SearchDocumentsByDocumentIdAsync(string documentId);
    Task<List<DocumentDto>> CrossReferenceSearchAsync(List<string> customerIds);
    Task<List<PartyDocumentLinkDto>> GetPartyDocumentLinksAsync(string documentId);
    Task<List<PartyDocumentLinkDto>> GetCustomerDocumentLinksAsync(string customerId);
}