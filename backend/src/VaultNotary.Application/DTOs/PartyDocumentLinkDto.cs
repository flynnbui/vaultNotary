using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class PartyDocumentLinkDto
{
    public string DocumentId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public PartyRole PartyRole { get; set; }

    //TODO: Add signature status later on
    public SignatureStatus SignatureStatus { get; set; } = SignatureStatus.Signed;
    public DateTime NotaryDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreatePartyDocumentLinkDto
{
    public string CustomerId { get; set; } = string.Empty;
    public PartyRole PartyRole { get; set; }
    public DateTime NotaryDate { get; set; }
}

public class UpdatePartyDocumentLinkDto
{
    public PartyRole PartyRole { get; set; }
    public DateTime NotaryDate { get; set; }
}