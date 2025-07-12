using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace VaultNotary.Domain.Entities;

[Index(nameof(CustomerId))]
public class PartyDocumentLink
{
    [Required]
    [MaxLength(50)]
    [ForeignKey(nameof(Document))]
    public string DocumentId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    [ForeignKey(nameof(Customer))]
    public string CustomerId { get; set; } = string.Empty;
    
    [Required]
    public PartyRole PartyRole { get; set; }
    
    public SignatureStatus SignatureStatus { get; set; }
    
    [Required]
    public DateTime NotaryDate { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    public virtual Document Document { get; set; } = null!;
    public virtual Customer Customer { get; set; } = null!;
}

public enum PartyRole
{
    PartyA,
    PartyB,
    PartyC,
    Notary
}

public enum SignatureStatus
{
    Pending,
    Signed,
    Rejected
}