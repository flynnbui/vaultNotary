using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Data;

namespace VaultNotary.Infrastructure.Repositories;

public class EfPartyDocumentRepository : IPartyDocumentRepository
{
    private readonly VaultNotaryDbContext _context;

    public EfPartyDocumentRepository(VaultNotaryDbContext context)
    {
        _context = context;
    }

    public async Task<List<PartyDocumentLink>> GetByDocumentIdAsync(string documentId)
    {
        return await _context.PartyDocumentLinks
            .Include(pdl => pdl.Document)
            .ThenInclude(d => d.Files)
            .Include(pdl => pdl.Customer)
            .Where(pdl => pdl.DocumentId == documentId)
            .OrderBy(pdl => pdl.PartyRole)
            .ThenBy(pdl => pdl.Customer.FullName)
            .ToListAsync();
    }

    public async Task<List<PartyDocumentLink>> GetByCustomerIdAsync(string customerId)
    {
        return await _context.PartyDocumentLinks
            .Include(pdl => pdl.Document)
            .ThenInclude(d => d.Files)
            .Include(pdl => pdl.Customer)
            .Where(pdl => pdl.CustomerId == customerId)
            .OrderByDescending(pdl => pdl.NotaryDate)
            .ThenBy(pdl => pdl.PartyRole)
            .ToListAsync();
    }

    public async Task<PartyDocumentLink?> GetByDocumentAndCustomerAsync(string documentId, string customerId)
    {
        return await _context.PartyDocumentLinks
            .Include(pdl => pdl.Document)
            .ThenInclude(d => d.Files)
            .Include(pdl => pdl.Customer)
            .FirstOrDefaultAsync(pdl => pdl.DocumentId == documentId && pdl.CustomerId == customerId);
    }

    public async Task<List<PartyDocumentLink>> GetByRoleAsync(PartyRole role)
    {
        return await _context.PartyDocumentLinks
            .Include(pdl => pdl.Document)
            .ThenInclude(d => d.Files)
            .Include(pdl => pdl.Customer)
            .Where(pdl => pdl.PartyRole == role)
            .OrderByDescending(pdl => pdl.NotaryDate)
            .ThenBy(pdl => pdl.Customer.FullName)
            .ToListAsync();
    }

    public async Task<List<PartyDocumentLink>> CrossReferenceSearchAsync(List<string> customerIds)
    {
        // Advanced LINQ for cross-reference search - finds documents where multiple customers are involved
        return await _context.PartyDocumentLinks
            .Include(pdl => pdl.Document)
            .ThenInclude(d => d.Files)
            .Include(pdl => pdl.Customer)
            .Where(pdl => customerIds.Contains(pdl.CustomerId))
            .GroupBy(pdl => pdl.DocumentId)
            .Where(g => g.Select(pdl => pdl.CustomerId).Distinct().Count() > 1) // Documents with multiple customers
            .SelectMany(g => g)
            .OrderByDescending(pdl => pdl.NotaryDate)
            .ThenBy(pdl => pdl.Document.TransactionCode)
            .ToListAsync();
    }

    public async Task CreateAsync(PartyDocumentLink link)
    {
        link.CreatedAt = DateTime.UtcNow;
        link.UpdatedAt = DateTime.UtcNow;
        
        _context.PartyDocumentLinks.Add(link);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(PartyDocumentLink link)
    {
        link.UpdatedAt = DateTime.UtcNow;
        
        _context.PartyDocumentLinks.Update(link);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string documentId, string customerId)
    {
        var link = await _context.PartyDocumentLinks
            .FirstOrDefaultAsync(pdl => pdl.DocumentId == documentId && pdl.CustomerId == customerId);
            
        if (link != null)
        {
            _context.PartyDocumentLinks.Remove(link);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string documentId, string customerId)
    {
        return await _context.PartyDocumentLinks
            .AnyAsync(pdl => pdl.DocumentId == documentId && pdl.CustomerId == customerId);
    }
}