using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class CreateFileDto
{
    public DateTime CreatedDate { get; set; }
    public string Secretary { get; set; } = string.Empty;
    public string NotaryPublic { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public PartiesDto Parties { get; set; } = new();
}

public class PartiesDto
{
    public List<PartyMemberDto> A { get; set; } = new();
    public List<PartyMemberDto> B { get; set; } = new();
    public List<PartyMemberDto>? C { get; set; } = new();
}

public class PartyMemberDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime NotaryDate { get; set; }
}