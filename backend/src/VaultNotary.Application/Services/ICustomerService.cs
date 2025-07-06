using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface ICustomerService
{
    Task<CustomerDto?> GetByIdAsync(string id);
    Task<CustomerDto?> GetByDocumentIdAsync(string documentId);
    Task<CustomerDto?> GetByPassportIdAsync(string passportId);
    Task<CustomerDto?> GetByBusinessRegistrationAsync(string businessRegistrationNumber);
    Task<List<CustomerDto>> SearchByIdentityAsync(string identity);
    Task<List<CustomerDto>> GetAllAsync();
    Task<string> CreateAsync(CreateCustomerDto createCustomerDto);
    Task UpdateAsync(string id, UpdateCustomerDto updateCustomerDto);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<bool> ValidateIdentityAsync(string identity);
    Task<List<CustomerDto>> DetectDuplicatesAsync(CreateCustomerDto createCustomerDto);
}