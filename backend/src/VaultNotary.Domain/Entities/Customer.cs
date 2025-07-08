namespace VaultNotary.Domain.Entities;

public class Customer : IEquatable<Customer>
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public CustomerType Type { get; set; }
    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PartyDocumentLink> PartyDocumentLinks { get; set; } = new();

    public bool Equals(Customer? other)
    {
        if (other is null) return false;
        return Id == other.Id;
    }

    public override bool Equals(object? obj)
    {
        if (obj is null) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (obj.GetType() != GetType()) return false;
        return Equals(obj as Customer);
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}

public enum CustomerType
{
    Individual,
    Business
}