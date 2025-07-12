using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class DocumentDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string Secretary { get; set; } = string.Empty;
    public string NotaryPublic { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentType DocumentType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PartyDocumentLinkDto> PartyDocumentLinks { get; set; } = new();
    public List<DocumentFileDto> Files { get; set; } = new();
}

public class DocumentListDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string Secretary { get; set; } = string.Empty;
    public string NotaryPublic { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentType DocumentType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDocumentDto
{
    public DateTime CreatedDate { get; set; }
    public string Secretary { get; set; } = string.Empty;
    public string NotaryPublic { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentType DocumentType { get; set; }
    public List<PartyDocumentLinkDto> Parties { get; set; } = new();
}


public class UpdateDocumentDto
{
    public DateTime CreatedDate { get; set; }
    public string Secretary { get; set; } = string.Empty;
    public string NotaryPublic { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DocumentType DocumentType { get; set; }
}

public class DocumentFileDto
{
    public string Id { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
    public string S3Bucket { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDocumentFileDto
{
    public string DocumentId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
    public string S3Bucket { get; set; } = string.Empty;
}

public class UpdateDocumentFileDto
{
    public string ContentType { get; set; } = string.Empty;
    public string S3Key { get; set; } = string.Empty;
}

public class DocumentWithFilesDto
{
    public DocumentDto Document { get; set; } = new();
    public List<DocumentFileDto> Files { get; set; } = new();
}