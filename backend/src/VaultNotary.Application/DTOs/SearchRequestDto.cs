using System.ComponentModel.DataAnnotations;

namespace VaultNotary.Application.DTOs;

public class SearchRequestDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize { get; set; } = 10;
}

public class DateRangeSearchRequestDto : SearchRequestDto
{
    [Required(ErrorMessage = "From date is required")]
    public DateTime From { get; set; }

    [Required(ErrorMessage = "To date is required")]
    public DateTime To { get; set; }
}