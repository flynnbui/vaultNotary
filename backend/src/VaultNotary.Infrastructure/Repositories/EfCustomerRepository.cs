using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Data;

namespace VaultNotary.Infrastructure.Repositories;

public class EfCustomerRepository : ICustomerRepository
{
    private readonly VaultNotaryDbContext _context;

    public EfCustomerRepository(VaultNotaryDbContext context)
    {
        _context = context;
    }

    public async Task<Customer?> GetByIdAsync(string id)
    {
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Customer?> GetByDocumentIdAsync(string documentId)
    {
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .FirstOrDefaultAsync(c => c.DocumentId == documentId);
    }

    public async Task<Customer?> GetByPassportIdAsync(string passportId)
    {
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .FirstOrDefaultAsync(c => c.PassportId == passportId);
    }

    public async Task<Customer?> GetByBusinessRegistrationAsync(string businessRegistrationNumber)
    {
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .FirstOrDefaultAsync(c => c.BusinessRegistrationNumber == businessRegistrationNumber);
    }

    public async Task<List<Customer>> SearchByIdentityAsync(string identity)
    {
        // Handle null or empty identity
        if (string.IsNullOrWhiteSpace(identity))
            return new List<Customer>();
            
        // Use LINQ for better performance - single query with multiple conditions
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .Where(c => c.DocumentId == identity || 
                       c.PassportId == identity || 
                       c.BusinessRegistrationNumber == identity)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<Customer>> GetAllAsync()
    {
        return await _context.Customers
            .Include(c => c.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Document)
            .OrderBy(c => c.FullName)
            .ToListAsync();
    }

    public async Task<string> CreateAsync(Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;
        
        if (string.IsNullOrEmpty(customer.Id))
        {
            customer.Id = Guid.NewGuid().ToString();
        }

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer.Id;
    }

    public async Task UpdateAsync(Customer customer)
    {
        customer.UpdatedAt = DateTime.UtcNow;
        
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer != null)
        {
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.Customers.AnyAsync(c => c.Id == id);
    }
}