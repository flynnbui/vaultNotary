using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace VaultNotary.Domain.Entities;

[Index(nameof(FullName))]
[Index(nameof(DocumentId))]
public class Customer
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;
    [Required]
    public Gender Gender { get; set; }
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? Phone { get; set; }
    
   
    [MaxLength(255)]
    public string? Email { get; set; }
    
    [Required]
    public CustomerType Type { get; set; }
    
    [MaxLength(50)]
    public string? DocumentId { get; set; }
    
    [MaxLength(50)]
    public string? PassportId { get; set; }
    
    [MaxLength(100)]
    public string? BusinessRegistrationNumber { get; set; }
    
    [MaxLength(255)]
    public string? BusinessName { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    public virtual ICollection<PartyDocumentLink> PartyDocumentLinks { get; set; } = new List<PartyDocumentLink>();
}

public enum CustomerType
{
    Individual,
    Business
}
public enum Gender
{
    Male,
    Female,
    Other
}