namespace VaultNotary.Domain.Entities;

public class PartyDocumentLink
{
    public string DocumentId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public PartyRole PartyRole { get; set; }
    public SignatureStatus SignatureStatus { get; set; }
    public DateTime NotaryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public Document Document { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
}

public enum PartyRole
{
    PartyA,
    PartyB,
    Witness,
    Notary
}

public enum SignatureStatus
{
    Pending,
    Signed,
    Rejected
}