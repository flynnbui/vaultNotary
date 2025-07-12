using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IPartyDocumentRepository _partyDocumentRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IDocumentFileService _documentFileService;

    public DocumentService(
        IDocumentRepository documentRepository,
        IPartyDocumentRepository partyDocumentRepository,
        ICustomerRepository customerRepository,
        IDocumentFileService documentFileService)
    {
        _documentRepository = documentRepository;
        _partyDocumentRepository = partyDocumentRepository;
        _customerRepository = customerRepository;
        _documentFileService = documentFileService;
    }

    public async Task<DocumentDto?> GetByIdAsync(string id)
    {
        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) return null;
        
        var dto = MapToDto(document);
        dto.Files = await _documentFileService.GetByDocumentIdAsync(id);
        return dto;
    }

    public async Task<DocumentDto?> GetByTransactionCodeAsync(string transactionCode)
    {
        // Using LINQ for better performance - leveraging EF's Where clause
        var documents = await _documentRepository.GetAllAsync();
        var document = documents.FirstOrDefault(d => d.TransactionCode == transactionCode);
        return document == null ? null : MapToDto(document);
    }

    public async Task<List<DocumentDto>> GetByCustomerIdAsync(string customerId)
    {
        var documents = await _documentRepository.GetByCustomerIdAsync(customerId);
        return documents.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentDto>> SearchAsync(string query)
    {
        var documents = await _documentRepository.SearchAsync(query);
        return documents.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentDto>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        var documents = await _documentRepository.GetByNotaryDateRangeAsync(from, to);
        return documents.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentDto>> GetByNotaryAsync(string notaryPublic)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for filtering with better performance
        var filtered = documents.Where(d => d.NotaryPublic.Contains(notaryPublic, StringComparison.OrdinalIgnoreCase)).ToList();
        return filtered.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentDto>> GetBySecretaryAsync(string secretary)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for filtering with better performance
        var filtered = documents.Where(d => d.Secretary.Contains(secretary, StringComparison.OrdinalIgnoreCase)).ToList();
        return filtered.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentDto>> GetByDocumentTypeAsync(string documentType)
    {
        var documents = await _documentRepository.GetAllAsync();
        // Using LINQ for filtering with better performance
        var filtered = documents.Where(d => d.DocumentType.Contains(documentType, StringComparison.OrdinalIgnoreCase)).ToList();
        return filtered.Select(MapToDto).ToList();
    }

    public async Task<List<DocumentListDto>> GetAllAsync()
    {
        var documents = await _documentRepository.GetAllDocumentsAsync();
        return documents.Select(d => new DocumentListDto
        {
            Id = d.Id,
            CreatedDate = d.CreatedDate,
            Secretary = d.Secretary,
            NotaryPublic = d.NotaryPublic,
            TransactionCode = d.TransactionCode,
            Description = d.Description,
            DocumentType = d.DocumentType,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        }).ToList();
    }

    public async Task<PaginatedResult<DocumentListDto>> GetAllDocumentsAsync(int pageNumber = 1, int pageSize = 10)
    {
        var skip = (pageNumber - 1) * pageSize;
        var documents = await _documentRepository.GetAllDocumentsAsync(skip, pageSize);
        var totalCount = await _documentRepository.GetTotalCountAsync();

        return new PaginatedResult<DocumentListDto>
        {
            Items = documents.Select(d => new DocumentListDto
            {
                Id = d.Id,
                CreatedDate = d.CreatedDate,
                Secretary = d.Secretary,
                NotaryPublic = d.NotaryPublic,
                TransactionCode = d.TransactionCode,
                Description = d.Description,
                DocumentType = d.DocumentType,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<string> CreateAsync(CreateDocumentDto createDocumentDto)
    {
        var existingDocument = await GetByTransactionCodeAsync(createDocumentDto.TransactionCode);
        if (existingDocument != null)
        {
            throw new InvalidOperationException($"Document with transaction code '{createDocumentDto.TransactionCode}' already exists.");
        }
        // Validate all customers exist before creating document
        foreach (var partyDto in createDocumentDto.Parties)
        {
            if (!string.IsNullOrWhiteSpace(partyDto.CustomerId))
            {
                var customerExists = await _customerRepository.ExistsAsync(partyDto.CustomerId);
                if (!customerExists)
                {
                    throw new InvalidOperationException($"Customer with ID '{partyDto.CustomerId}' does not exist.");
                }
            }
        }
        var document = new Document
        {
            Id = Guid.NewGuid().ToString(),
            CreatedDate = createDocumentDto.CreatedDate,
            Secretary = createDocumentDto.Secretary,
            NotaryPublic = createDocumentDto.NotaryPublic,
            TransactionCode = createDocumentDto.TransactionCode,
            Description = createDocumentDto.Description,
            DocumentType = createDocumentDto.DocumentType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var documentId = await _documentRepository.CreateAsync(document);

        // Create party document links
        foreach (var partyDto in createDocumentDto.Parties)
        {
            var partyLink = new PartyDocumentLink
            {
                DocumentId = documentId,
                CustomerId = partyDto.CustomerId,
                PartyRole = partyDto.PartyRole,
                NotaryDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _partyDocumentRepository.CreateAsync(partyLink);
        }

        return documentId;
    }

    public async Task UpdateAsync(string id, UpdateDocumentDto updateDocumentDto)
    {
        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) throw new ArgumentException("Document not found");

        document.CreatedDate = updateDocumentDto.CreatedDate;
        document.Secretary = updateDocumentDto.Secretary;
        document.NotaryPublic = updateDocumentDto.NotaryPublic;
        document.TransactionCode = updateDocumentDto.TransactionCode;
        document.Description = updateDocumentDto.Description;
        document.DocumentType = updateDocumentDto.DocumentType;
        document.UpdatedAt = DateTime.UtcNow;

        await _documentRepository.UpdateAsync(document);
    }

    public async Task DeleteAsync(string id)
    {
        await _documentRepository.DeleteAsync(id);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _documentRepository.ExistsAsync(id);
    }

    public async Task LinkPartyAsync(string documentId, CreatePartyDocumentLinkDto linkDto)
    {
        var customerExists = await _customerRepository.ExistsAsync(linkDto.CustomerId);
        if (!customerExists)
        {
            throw new InvalidOperationException($"Customer with ID '{linkDto.CustomerId}' does not exist.");
        }
        var partyLink = new PartyDocumentLink
        {
            DocumentId = documentId,
            CustomerId = linkDto.CustomerId,
            PartyRole = linkDto.PartyRole,
            NotaryDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _partyDocumentRepository.CreateAsync(partyLink);
    }

    public async Task UnlinkPartyAsync(string documentId, string customerId)
    {
        var customerExists = await _customerRepository.ExistsAsync(customerId);
        if (!customerExists)
        {
            throw new InvalidOperationException($"Customer with ID '{customerId}' does not exist.");
        }
        await _partyDocumentRepository.DeleteAsync(documentId, customerId);
    }

    public async Task<List<DocumentDto>> GetByPartyIdAsync(string partyId)
    {
        var documents = await _documentRepository.GetByCustomerIdAsync(partyId);
        return documents.Select(MapToDto).ToList();
    }

    private static DocumentDto MapToDto(Document document)
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
            PartyDocumentLinks = document.PartyDocumentLinks?.Select(MapPartyLinkToDto).ToList() ?? new List<PartyDocumentLinkDto>(),
            Files = new List<DocumentFileDto>() // Will be populated by calling service if needed
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

    private static DocumentFileDto MapFileToDto(DocumentFile file)
    {
        return new DocumentFileDto
        {
            Id = file.Id,
            DocumentId = file.DocumentId,
            ContentType = file.ContentType,
            S3Key = file.S3Key,
            CreatedAt = file.CreatedAt,
            UpdatedAt = file.UpdatedAt
        };
    }
}