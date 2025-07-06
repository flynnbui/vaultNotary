namespace VaultNotary.Domain.Entities;

public class Document
{
    public string Id { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string Sha256Hash { get; set; } = string.Empty;
    public string? Signature { get; set; }
    public string? NotaryPublic { get; set; }
    public DocumentType DocumentType { get; set; }
    public DateTime NotaryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PartyDocumentLink> PartyDocumentLinks { get; set; } = new();
}

public enum DocumentType
{
    Contract,
    Agreement,
    Certificate,
    Identity,
    Other
}