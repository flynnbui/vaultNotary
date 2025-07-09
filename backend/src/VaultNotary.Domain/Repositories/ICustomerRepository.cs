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
    Task<List<Customer>> GetAllCustomersAsync();
    Task<List<Customer>> GetAllCustomersAsync(int skip, int take);
    Task<int> GetTotalCountAsync();
    Task<string> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
}