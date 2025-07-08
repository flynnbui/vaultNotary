using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.Application.Services;

public class SearchService : ISearchService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IDocumentFileRepository _documentFileRepository;
    private readonly IPartyDocumentRepository _partyDocumentRepository;

    public SearchService(
        IDocumentRepository documentRepository,
        ICustomerRepository customerRepository,
        IDocumentFileRepository documentFileRepository,
        IPartyDocumentRepository partyDocumentRepository)
    {
        _documentRepository = documentRepository;
        _customerRepository = customerRepository;
        _documentFileRepository = documentFileRepository;
        _partyDocumentRepository = partyDocumentRepository;
    }

    // Document search methods with LINQ optimization
    public async Task<List<DocumentDto>> SearchDocumentsAsync(string query)
    {
        var documents = await _documentRepository.SearchAsync(query);
        return documents.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByTransactionCodeAsync(string transactionCode)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for optimized filtering
        var filtered = documents.Where(d => d.TransactionCode.Contains(transactionCode, StringComparison.OrdinalIgnoreCase))
                               .OrderByDescending(d => d.CreatedDate)
                               .ToList();
        return filtered.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByNotaryAsync(string notaryPublic)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for optimized filtering
        var filtered = documents.Where(d => d.NotaryPublic.Contains(notaryPublic, StringComparison.OrdinalIgnoreCase))
                               .OrderByDescending(d => d.CreatedDate)
                               .ToList();
        return filtered.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsBySecretaryAsync(string secretary)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for optimized filtering
        var filtered = documents.Where(d => d.Secretary.Contains(secretary, StringComparison.OrdinalIgnoreCase))
                               .OrderByDescending(d => d.CreatedDate)
                               .ToList();
        return filtered.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByTypeAsync(string documentType)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for optimized filtering
        var filtered = documents.Where(d => d.DocumentType.Contains(documentType, StringComparison.OrdinalIgnoreCase))
                               .OrderByDescending(d => d.CreatedDate)
                               .ToList();
        return filtered.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByDateRangeAsync(DateTime from, DateTime to)
    {
        var documents = await _documentRepository.GetByNotaryDateRangeAsync(from, to);
        return documents.Select(MapDocumentToDto).ToList();
    }

    // Customer search methods with LINQ optimization
    public async Task<List<CustomerDto>> SearchCustomersByIdentityAsync(string identity)
    {
        var customers = await _customerRepository.SearchByIdentityAsync(identity);
        return customers.Select(MapCustomerToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByCustomerAsync(string customerId)
    {
        var documents = await _documentRepository.GetByCustomerIdAsync(customerId);
        return documents.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByBusinessRegistrationAsync(string businessRegistrationNumber)
    {
        var customer = await _customerRepository.GetByBusinessRegistrationAsync(businessRegistrationNumber);
        if (customer == null) return new List<DocumentDto>();

        var documents = await _documentRepository.GetByCustomerIdAsync(customer.Id);
        return documents.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchDocumentsByPassportAsync(string passportId)
    {
        var customer = await _customerRepository.GetByPassportIdAsync(passportId);
        if (customer == null) return new List<DocumentDto>();

        var documents = await _documentRepository.GetByCustomerIdAsync(customer.Id);
        return documents.Select(MapDocumentToDto).ToList();
    }

    public async Task<List<DocumentDto>> CrossReferenceSearchAsync(List<string> customerIds)
    {
        var partyLinks = await _partyDocumentRepository.CrossReferenceSearchAsync(customerIds);
        
        // Using LINQ to group and extract unique documents with better performance
        var uniqueDocuments = partyLinks
            .GroupBy(pl => pl.DocumentId)
            .Select(g => g.First().Document)
            .Distinct()
            .OrderByDescending(d => d.CreatedDate)
            .ToList();

        return uniqueDocuments.Select(MapDocumentToDto).ToList();
    }

    // File search methods with LINQ optimization
    public async Task<List<DocumentFileDto>> SearchFilesByNameAsync(string fileName)
    {
        var files = await _documentFileRepository.SearchByFileNameAsync(fileName);
        return files.Select(MapFileToDto).ToList();
    }

    public async Task<List<DocumentFileDto>> SearchFilesByContentTypeAsync(string contentType)
    {
        var files = await _documentFileRepository.GetAllAsync();
        // Using LINQ for optimized filtering
        var filtered = files.Where(f => f.ContentType.Contains(contentType, StringComparison.OrdinalIgnoreCase))
                           .OrderByDescending(f => f.CreatedAt)
                           .ToList();
        return filtered.Select(MapFileToDto).ToList();
    }

    public async Task<List<DocumentFileDto>> GetFilesByDocumentIdAsync(string documentId)
    {
        var files = await _documentFileRepository.GetByDocumentIdAsync(documentId);
        return files.Select(MapFileToDto).ToList();
    }

    // Relationship search methods with LINQ optimization
    public async Task<List<PartyDocumentLinkDto>> GetPartyDocumentLinksAsync(string documentId)
    {
        var links = await _partyDocumentRepository.GetByDocumentIdAsync(documentId);
        return links.Select(MapPartyLinkToDto).ToList();
    }

    public async Task<List<PartyDocumentLinkDto>> GetCustomerDocumentLinksAsync(string customerId)
    {
        var links = await _partyDocumentRepository.GetByCustomerIdAsync(customerId);
        return links.Select(MapPartyLinkToDto).ToList();
    }

    public async Task<List<DocumentFileLinkDto>> GetDocumentFileLinksAsync(string documentId)
    {
        var files = await _documentFileRepository.GetByDocumentIdAsync(documentId);
        return files.Select(file => new DocumentFileLinkDto
        {
            DocumentId = file.DocumentId,
            FileId = file.Id,
            FileName = file.FileName,
            FileSize = file.FileSize,
            ContentType = file.ContentType,
            S3Key = file.S3Key,
            S3Bucket = file.S3Bucket,
            CreatedAt = file.CreatedAt,
            UpdatedAt = file.UpdatedAt
        }).ToList();
    }

    // Mapping methods
    private static DocumentDto MapDocumentToDto(Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            CreatedDate = document.CreatedDate,
            Secretary = document.Secretary,
            NotaryPublic = document.NotaryPublic,
            TransactionCode = document.TransactionCode,
            Description = document.Description,
            DocumentType = document.DocumentType,
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt,
            PartyDocumentLinks = document.PartyDocumentLinks.Select(MapPartyLinkToDto).ToList(),
            Files = document.Files.Select(MapFileToDto).ToList()
        };
    }

    private static CustomerDto MapCustomerToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Address = customer.Address,
            Phone = customer.Phone,
            Email = customer.Email,
            Type = customer.Type,
            DocumentId = customer.DocumentId,
            PassportId = customer.PassportId,
            BusinessRegistrationNumber = customer.BusinessRegistrationNumber,
            BusinessName = customer.BusinessName,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }

    private static DocumentFileDto MapFileToDto(DocumentFile file)
    {
        return new DocumentFileDto
        {
            Id = file.Id,
            DocumentId = file.DocumentId,
            FileName = file.FileName,
            FileSize = file.FileSize,
            ContentType = file.ContentType,
            S3Key = file.S3Key,
            S3Bucket = file.S3Bucket,
            CreatedAt = file.CreatedAt,
            UpdatedAt = file.UpdatedAt
        };
    }

    private static PartyDocumentLinkDto MapPartyLinkToDto(PartyDocumentLink link)
    {
        return new PartyDocumentLinkDto
        {
            DocumentId = link.DocumentId,
            CustomerId = link.CustomerId,
            PartyRole = link.PartyRole,
            SignatureStatus = link.SignatureStatus,
            NotaryDate = link.NotaryDate,
            CreatedAt = link.CreatedAt,
            UpdatedAt = link.UpdatedAt
        };
    }
}