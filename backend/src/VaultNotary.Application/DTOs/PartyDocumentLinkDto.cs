using System.ComponentModel.DataAnnotations;
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
    [Required(ErrorMessage = "Mã khách hàng là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Mã khách hàng không được để trống.")]
    public string CustomerId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vai trò của bên tham gia là bắt buộc.")]
    public PartyRole PartyRole { get; set; }
}

public class UpdatePartyDocumentLinkDto
{
    public PartyRole PartyRole { get; set; }
    public DateTime NotaryDate { get; set; }
}

