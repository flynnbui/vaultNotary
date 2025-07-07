using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class DocumentDto
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
    public List<PartyDocumentLinkDto> PartyDocumentLinks { get; set; } = new();
}

public class CreateDocumentDto
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? NotaryPublic { get; set; }
    public DocumentType DocumentType { get; set; }
    public DateTime NotaryDate { get; set; }
}

public class CreateFileDto
{
    public DateTime NgayTao { get; set; }
    public string ThuKy { get; set; } = string.Empty;
    public string CongChungVien { get; set; } = string.Empty;
    public string MaGiaoDich { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string LoaiHoSo { get; set; } = string.Empty;
    public PartiesDto Parties { get; set; } = new();
}

public class PartiesDto
{
    public List<PartyMemberDto> A { get; set; } = new();
    public List<PartyMemberDto> B { get; set; } = new();
    public List<PartyMemberDto>? C { get; set; }
}

public class PartyMemberDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string IdType { get; set; } = string.Empty;
    public string IdNumber { get; set; } = string.Empty;
    public string Dob { get; set; } = string.Empty;
}

public class UpdateDocumentDto
{
    public string FileName { get; set; } = string.Empty;
    public string? NotaryPublic { get; set; }
    public DocumentType DocumentType { get; set; }
    public DateTime NotaryDate { get; set; }
}