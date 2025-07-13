using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Data;
using VaultNotary.Application.DTOs;

namespace VaultNotary.Infrastructure.Repositories;

public class EfDocumentRepository : IDocumentRepository
{
    private readonly VaultNotaryDbContext _context;

    public EfDocumentRepository(VaultNotaryDbContext context)
    {
        _context = context;
    }

    public async Task<Document?> GetByIdAsync(string id)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Document?> GetByHashAsync(string sha256Hash)
    {
        // Note: This searches for documents with files matching the hash in S3Key
        // Adjust this logic based on how you store hash information
        return await _context.Documents
            .Include(d => d.Files)
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .FirstOrDefaultAsync(d => d.Files.Any(f => f.S3Key.Contains(sha256Hash)));
    }

    public async Task<List<Document>> GetByCustomerIdAsync(string customerId)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => d.PartyDocumentLinks.Any(pdl => pdl.CustomerId == customerId))
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }

    public async Task<List<Document>> SearchAsync(string query)
    {
        // Handle null or empty queries
        if (string.IsNullOrWhiteSpace(query))
            return new List<Document>();
            
        // Advanced LINQ search across multiple fields for better performance
        var searchTerm = query.ToLower();
        
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => EF.Functions.Like(d.TransactionCode.ToLower(), $"%{searchTerm}%") ||
                       EF.Functions.Like(d.Secretary.ToLower(), $"%{searchTerm}%") ||
                       EF.Functions.Like(d.NotaryPublic.ToLower(), $"%{searchTerm}%") ||
                       EF.Functions.Like(d.DocumentType.ToLower(), $"%{searchTerm}%") ||
                       EF.Functions.Like(d.Description!.ToLower(), $"%{searchTerm}%") ||
                       d.PartyDocumentLinks.Any(pdl => 
                           EF.Functions.Like(pdl.Customer.FullName.ToLower(), $"%{searchTerm}%") ||
                           EF.Functions.Like(pdl.Customer.DocumentId!, $"%{searchTerm}%") ||
                           EF.Functions.Like(pdl.Customer.PassportId!, $"%{searchTerm}%") ||
                           EF.Functions.Like(pdl.Customer.BusinessRegistrationNumber!, $"%{searchTerm}%")))
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }

    public async Task<List<Document>> GetByNotaryDateRangeAsync(DateTime from, DateTime to)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => d.PartyDocumentLinks.Any(pdl => 
                pdl.NotaryDate.Date >= from.Date && 
                pdl.NotaryDate.Date <= to.Date))
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }


    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Documents.CountAsync();
    }

    public async Task<Document?> GetByIdWithFilesAsync(string id)
    {
        return await _context.Documents
            .Include(d => d.Files)
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<(List<Document> Documents, int TotalCount)> GetPagedAsync(int skip, int take, string? searchTerm = null)
    {
        var query = _context.Documents.AsQueryable();
        
        if (!string.IsNullOrEmpty(searchTerm))
        {
            var lowerSearchTerm = searchTerm.ToLower();
            query = query.Where(d => 
                EF.Functions.Like(d.TransactionCode.ToLower(), $"%{lowerSearchTerm}%") ||
                EF.Functions.Like(d.DocumentType.ToLower(), $"%{lowerSearchTerm}%") ||
                EF.Functions.Like(d.Secretary.ToLower(), $"%{lowerSearchTerm}%") ||
                EF.Functions.Like(d.NotaryPublic.ToLower(), $"%{lowerSearchTerm}%") ||
                EF.Functions.Like(d.Description!.ToLower(), $"%{lowerSearchTerm}%"));
        }
        
        var totalCount = await query.CountAsync();
        var documents = await query
            .AsNoTracking()
            .OrderByDescending(d => d.CreatedDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
            
        return (documents, totalCount);
    }

    public async Task<Document?> GetByTransactionCodeAsync(string transactionCode)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.TransactionCode == transactionCode);
    }

    public async Task<List<Document>> GetByNotaryPublicAsync(string notaryPublic)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => d.NotaryPublic == notaryPublic)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }

    public async Task<List<Document>> GetBySecretaryAsync(string secretary)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => d.Secretary == secretary)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }

    public async Task<List<Document>> GetByDocumentTypeAsync(string documentType)
    {
        return await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .AsNoTracking()
            .Where(d => d.DocumentType == documentType)
            .OrderByDescending(d => d.CreatedDate)
            .ToListAsync();
    }

    public async Task<string> CreateAsync(Document document)
    {
        document.CreatedAt = DateTime.UtcNow;
        document.UpdatedAt = DateTime.UtcNow;
        
        if (string.IsNullOrEmpty(document.Id))
        {
            document.Id = Guid.NewGuid().ToString();
        }

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document.Id;
    }

    public async Task UpdateAsync(Document document)
    {
        document.UpdatedAt = DateTime.UtcNow;
        
        _context.Documents.Update(document);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string id)
    {
        var document = await _context.Documents
            .Include(d => d.PartyDocumentLinks)
            .FirstOrDefaultAsync(d => d.Id == id);
            
        if (document != null)
        {
            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.Documents.AnyAsync(d => d.Id == id);
    }
}