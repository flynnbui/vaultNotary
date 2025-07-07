using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class CustomerDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public CustomerType Type { get; set; }
    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCustomerDto
{
    public string FullName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public CustomerType Type { get; set; }
    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
}

public class UpdateCustomerDto
{
    public string FullName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public CustomerType Type { get; set; }
    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
}