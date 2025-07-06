using VaultNotary.Domain.Entities;

namespace VaultNotary.Domain.Repositories;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(string id);
    Task<Customer?> GetByDocumentIdAsync(string documentId);
    Task<Customer?> GetByPassportIdAsync(string passportId);
    Task<Customer?> GetByBusinessRegistrationAsync(string businessRegistrationNumber);
    Task<List<Customer>> SearchByIdentityAsync(string identity);
    Task<List<Customer>> GetAllAsync();
    Task<string> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}