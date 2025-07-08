using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Data;

namespace VaultNotary.Infrastructure.Repositories;

public class EfDocumentFileRepository : IDocumentFileRepository
{
    private readonly VaultNotaryDbContext _context;

    public EfDocumentFileRepository(VaultNotaryDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentFile?> GetByIdAsync(string id)
    {
        return await _context.Files
            .Include(f => f.Document)
            .ThenInclude(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<List<DocumentFile>> GetByDocumentIdAsync(string documentId)
    {
        return await _context.Files
            .Include(f => f.Document)
            .Where(f => f.DocumentId == documentId)
            .OrderBy(f => f.FileName)
            .ToListAsync();
    }

    public async Task<DocumentFile?> GetByS3KeyAsync(string s3Key)
    {
        return await _context.Files
            .Include(f => f.Document)
            .ThenInclude(d => d.PartyDocumentLinks)
            .ThenInclude(pdl => pdl.Customer)
            .FirstOrDefaultAsync(f => f.S3Key == s3Key);
    }

    public async Task<List<DocumentFile>> SearchByFileNameAsync(string fileName)
    {
        return await _context.Files
            .Include(f => f.Document)
            .Where(f => EF.Functions.Like(f.FileName.ToLower(), $"%{fileName.ToLower()}%"))
            .OrderBy(f => f.FileName)
            .ToListAsync();
    }

    public async Task<List<DocumentFile>> GetAllAsync()
    {
        return await _context.Files
            .Include(f => f.Document)
            .OrderByDescending(f => f.CreatedAt)
            .ThenBy(f => f.FileName)
            .ToListAsync();
    }

    public async Task<string> CreateAsync(DocumentFile documentFile)
    {
        documentFile.CreatedAt = DateTime.UtcNow;
        documentFile.UpdatedAt = DateTime.UtcNow;
        
        if (string.IsNullOrEmpty(documentFile.Id))
        {
            documentFile.Id = Guid.NewGuid().ToString();
        }

        _context.Files.Add(documentFile);
        await _context.SaveChangesAsync();
        return documentFile.Id;
    }

    public async Task UpdateAsync(DocumentFile documentFile)
    {
        documentFile.UpdatedAt = DateTime.UtcNow;
        
        _context.Files.Update(documentFile);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string id)
    {
        var documentFile = await _context.Files.FindAsync(id);
        if (documentFile != null)
        {
            _context.Files.Remove(documentFile);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(string id)
    {
        return await _context.Files.AnyAsync(f => f.Id == id);
    }

    public async Task<bool> ExistsByS3KeyAsync(string s3Key)
    {
        return await _context.Files.AnyAsync(f => f.S3Key == s3Key);
    }
}