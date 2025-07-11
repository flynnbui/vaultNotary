using System.ComponentModel.DataAnnotations;
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
    public string DocumentType { get; set; } = string.Empty;
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
    public string DocumentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateDocumentDto
{
    [Required(ErrorMessage = "Ngày tạo hồ sơ là bắt buộc.")]
    public DateTime CreatedDate { get; set; }

    [Required(ErrorMessage = "Tên thư ký là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Tên thư ký không được để trống.")]
    public string Secretary { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên công chứng viên là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Tên công chứng viên không được để trống.")]
    public string NotaryPublic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã giao dịch là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Mã giao dịch không được để trống.")]
    public string TransactionCode { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "Loại hồ sơ là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Loại hồ sơ không được để trống.")]
    public string DocumentType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phải có ít nhất một bên tham gia.")]
    [MinLength(1, ErrorMessage = "Danh sách các bên tham gia không được để trống.")]
    public List<PartyDocumentLinkDto> Parties { get; set; } = new();
}


public class UpdateDocumentDto
{
    [Required(ErrorMessage = "Ngày tạo hồ sơ là bắt buộc.")]
    public DateTime CreatedDate { get; set; }

    [Required(ErrorMessage = "Tên thư ký là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Tên thư ký không được để trống.")]
    public string Secretary { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên công chứng viên là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Tên công chứng viên không được để trống.")]
    public string NotaryPublic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã giao dịch là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Mã giao dịch không được để trống.")]
    public string TransactionCode { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "Loại hồ sơ là bắt buộc.")]
    [MinLength(1, ErrorMessage = "Loại hồ sơ không được để trống.")]
    public string DocumentType { get; set; } = string.Empty;
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