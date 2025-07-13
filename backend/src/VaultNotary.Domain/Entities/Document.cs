using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace VaultNotary.Domain.Entities;

[Index(nameof(TransactionCode), IsUnique = true)]
[Index(nameof(NotaryPublic))]
[Index(nameof(Secretary))]
[Index(nameof(DocumentType))]
[Index(nameof(CreatedDate))]
public class Document
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedDate { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Secretary { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string NotaryPublic { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string TransactionCode { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string DocumentType { get; set; } = string.Empty;
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    public virtual ICollection<PartyDocumentLink> PartyDocumentLinks { get; set; } = new List<PartyDocumentLink>();
    public virtual ICollection<DocumentFile> Files { get; set; } = new List<DocumentFile>();
}

[Index(nameof(DocumentId))]
public class DocumentFile
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [ForeignKey(nameof(Document))]
    public string DocumentId { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public long FileSize { get; set; }

    [Required]
    [MaxLength(100)]
    public string ContentType { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string S3Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string S3Bucket { get; set; } = string.Empty;

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public DateTime UpdatedAt { get; set; }

    public virtual Document Document { get; set; } = null!;
}
