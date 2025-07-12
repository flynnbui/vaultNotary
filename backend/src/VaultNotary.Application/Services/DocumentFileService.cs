using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.Application.Services;

public class DocumentFileService : IDocumentFileService
{
    private readonly IDocumentFileRepository _documentFileRepository;
    private readonly IFileService _fileService;

    public DocumentFileService(IDocumentFileRepository documentFileRepository, IFileService fileService)
    {
        _documentFileRepository = documentFileRepository;
        _fileService = fileService;
    }

    public async Task<DocumentFileDto?> GetByIdAsync(string id)
    {
        var documentFile = await _documentFileRepository.GetByIdAsync(id);
        if (documentFile == null) return null;

        return new DocumentFileDto
        {
            Id = documentFile.Id,
            DocumentId = documentFile.DocumentId,
            FileName = documentFile.FileName,
            FileSize = documentFile.FileSize,
            ContentType = documentFile.ContentType,
            S3Key = documentFile.S3Key,
            S3Bucket = documentFile.S3Bucket,
            CreatedAt = documentFile.CreatedAt,
            UpdatedAt = documentFile.UpdatedAt
        };
    }


    public async Task<List<DocumentFileDto>> GetByDocumentIdAsync(string documentId)
    {
        var documentFiles = await _documentFileRepository.GetByDocumentIdAsync(documentId);
        return documentFiles.Select(df => new DocumentFileDto
        {
            Id = df.Id,
            DocumentId = df.DocumentId,
            FileName = df.FileName,
            FileSize = df.FileSize,
            ContentType = df.ContentType,
            S3Key = df.S3Key,
            S3Bucket = df.S3Bucket,
            CreatedAt = df.CreatedAt,
            UpdatedAt = df.UpdatedAt
        }).ToList();
    }

    public async Task<List<DocumentFileDto>> GetAllAsync()
    {
        var documentFiles = await _documentFileRepository.GetAllAsync();
        return documentFiles.Select(df => new DocumentFileDto
        {
            Id = df.Id,
            DocumentId = df.DocumentId,
            FileName = df.FileName,
            FileSize = df.FileSize,
            ContentType = df.ContentType,
            S3Key = df.S3Key,
            S3Bucket = df.S3Bucket,
            CreatedAt = df.CreatedAt,
            UpdatedAt = df.UpdatedAt
        }).ToList();
    }

    public async Task<string> CreateAsync(CreateDocumentFileDto createDocumentFileDto)
    {
        var documentFile = new DocumentFile
        {
            Id = Guid.NewGuid().ToString(),
            DocumentId = createDocumentFileDto.DocumentId,
            FileName = createDocumentFileDto.FileName,
            FileSize = createDocumentFileDto.FileSize,
            ContentType = createDocumentFileDto.ContentType,
            S3Key = createDocumentFileDto.S3Key,
            S3Bucket = createDocumentFileDto.S3Bucket,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdId = await _documentFileRepository.CreateAsync(documentFile);
        return createdId;
    }

    public async Task UpdateAsync(string id, UpdateDocumentFileDto updateDocumentFileDto)
    {
        var existingFile = await _documentFileRepository.GetByIdAsync(id);
        if (existingFile == null) return;

        existingFile.ContentType = updateDocumentFileDto.ContentType;
        existingFile.S3Key = updateDocumentFileDto.S3Key;
        existingFile.UpdatedAt = DateTime.UtcNow;

        await _documentFileRepository.UpdateAsync(existingFile);
    }

    public async Task DeleteAsync(string id)
    {
        await _documentFileRepository.DeleteAsync(id);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        var documentFile = await _documentFileRepository.GetByIdAsync(id);
        return documentFile != null;
    }

    public async Task<bool> ValidateIntegrityAsync(string id)
    {
        var documentFile = await _documentFileRepository.GetByIdAsync(id);
        if (documentFile == null) return false;

        return await _fileService.ExistsAsync(documentFile.S3Key);
    }

    public async Task<string> GeneratePresignedUrlAsync(string id, TimeSpan expiration)
    {
        var documentFile = await _documentFileRepository.GetByIdAsync(id);
        if (documentFile == null) throw new ArgumentException("Document file not found");

        var presignedUrl = await _fileService.GetPresignedUrlAsync(documentFile.S3Key, expiration);
        return presignedUrl.Url;
    }
}