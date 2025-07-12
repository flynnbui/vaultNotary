using System.ComponentModel.DataAnnotations;
using VaultNotary.Domain.Entities;

namespace VaultNotary.Application.DTOs;

public class CustomerDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "Họ và tên không được để trống.")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public Gender Gender { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Địa chỉ không được để trống.")]
    public string Address { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? Email { get; set; }

    [Required]
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
    public Gender Gender { get; set; }

    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public CustomerType Type { get; set; }
    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
}

public class UpdateCustomerDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "Họ và tên không được để trống.")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public Gender Gender { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Địa chỉ không được để trống.")]
    public string Address { get; set; } = string.Empty;

    public string? Phone { get; set; }
    public string? Email { get; set; }

    [Required]
    public CustomerType Type { get; set; }

    public string? DocumentId { get; set; }
    public string? PassportId { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? BusinessName { get; set; }
    
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}