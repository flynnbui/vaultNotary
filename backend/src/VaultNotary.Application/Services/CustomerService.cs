using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<CustomerDto?> GetByIdAsync(string id)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByDocumentIdAsync(string documentId)
    {
        var customer = await _customerRepository.GetByDocumentIdAsync(documentId);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByPassportIdAsync(string passportId)
    {
        var customer = await _customerRepository.GetByPassportIdAsync(passportId);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByBusinessRegistrationAsync(string businessRegistrationNumber)
    {
        var customer = await _customerRepository.GetByBusinessRegistrationAsync(businessRegistrationNumber);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<List<CustomerDto>> SearchByIdentityAsync(string identity)
    {
        var customers = await _customerRepository.SearchByIdentityAsync(identity);
        return customers.Select(MapToDto).ToList();
    }

    public async Task<List<CustomerDto>> GetAllAsync()
    {
        var customers = await _customerRepository.GetAllCustomersAsync(0, 100); // Get first 100 customers with safety limit
        return customers.Select(MapToDto).ToList();
    }

    public async Task<PaginatedResult<CustomerDto>> GetAllCustomersAsync(int pageNumber = 1, int pageSize = 10)
    {
        var skip = (pageNumber - 1) * pageSize;
        var customers = await _customerRepository.GetAllCustomersAsync(skip, pageSize);
        var totalCount = await _customerRepository.GetTotalCountAsync();

        return new PaginatedResult<CustomerDto>
        {
            Items = customers.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<string> CreateAsync(CreateCustomerDto createCustomerDto)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid().ToString(),
            FullName = createCustomerDto.FullName,
            Gender = createCustomerDto.Gender,
            Address = createCustomerDto.Address,
            Phone = createCustomerDto.Phone,
            Email = createCustomerDto.Email,
            Type = createCustomerDto.Type,
            DocumentId = createCustomerDto.DocumentId,
            PassportId = createCustomerDto.PassportId,
            BusinessRegistrationNumber = createCustomerDto.BusinessRegistrationNumber,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _customerRepository.CreateAsync(customer);
    }

    public async Task UpdateAsync(string id, UpdateCustomerDto updateCustomerDto)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null) throw new ArgumentException("Customer not found");

        customer.FullName = updateCustomerDto.FullName;
        customer.Gender = updateCustomerDto.Gender;
        customer.Address = updateCustomerDto.Address;
        customer.Phone = updateCustomerDto.Phone;
        customer.Email = updateCustomerDto.Email;
        customer.Type = updateCustomerDto.Type;
        customer.DocumentId = updateCustomerDto.DocumentId;
        customer.PassportId = updateCustomerDto.PassportId;
        customer.BusinessRegistrationNumber = updateCustomerDto.BusinessRegistrationNumber;
         customer.BusinessName = updateCustomerDto.BusinessName;
        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);
    }

    public async Task DeleteAsync(string id)
    {
        await _customerRepository.DeleteAsync(id);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _customerRepository.ExistsAsync(id);
    }

    public async Task<List<CustomerDto>> DetectDuplicatesAsync(CreateCustomerDto createCustomerDto)
    {
        var duplicates = new List<Customer>();

        if (!string.IsNullOrEmpty(createCustomerDto.DocumentId))
        {
            var customerByDocId = await _customerRepository.GetByDocumentIdAsync(createCustomerDto.DocumentId);
            if (customerByDocId != null) duplicates.Add(customerByDocId);
        }

        if (!string.IsNullOrEmpty(createCustomerDto.PassportId))
        {
            var customerByPassport = await _customerRepository.GetByPassportIdAsync(createCustomerDto.PassportId);
            if (customerByPassport != null) duplicates.Add(customerByPassport);
        }

        if (!string.IsNullOrEmpty(createCustomerDto.BusinessRegistrationNumber))
        {
            var customerByBusiness = await _customerRepository.GetByBusinessRegistrationAsync(createCustomerDto.BusinessRegistrationNumber);
            if (customerByBusiness != null) duplicates.Add(customerByBusiness);
        }
        return duplicates.Distinct().Select(MapToDto).ToList();
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            Address = customer.Address,
            Phone = customer.Phone,
            Email = customer.Email,
            Type = customer.Type,
            DocumentId = customer.DocumentId,
            PassportId = customer.PassportId,
            BusinessRegistrationNumber = customer.BusinessRegistrationNumber,
            BusinessName = customer.BusinessName,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }
}