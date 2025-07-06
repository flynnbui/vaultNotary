using VaultNotary.Application.DTOs;
using VaultNotary.Domain.Repositories;
using VaultNotary.Domain.Services;

namespace VaultNotary.Application.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IHashService _hashService;

    public FileService(IFileRepository fileRepository, IHashService hashService)
    {
        _fileRepository = fileRepository;
        _hashService = hashService;
    }

    public async Task<string> UploadAsync(FileUploadDto fileUploadDto)
    {
        var key = $"{Guid.NewGuid()}_{fileUploadDto.FileName}";
        await _fileRepository.UploadAsync(key, fileUploadDto.FileStream, fileUploadDto.ContentType);
        return key;
    }

    public async Task<Stream> DownloadAsync(string key)
    {
        return await _fileRepository.DownloadAsync(key);
    }

    public async Task<PresignedUrlDto> GetPresignedUrlAsync(string key, TimeSpan expiration)
    {
        var url = await _fileRepository.GetPresignedUrlAsync(key, expiration);
        return new PresignedUrlDto
        {
            Url = url,
            ExpiresAt = DateTime.UtcNow.Add(expiration)
        };
    }

    public async Task<bool> ExistsAsync(string key)
    {
        return await _fileRepository.ExistsAsync(key);
    }

    public async Task DeleteAsync(string key)
    {
        await _fileRepository.DeleteAsync(key);
    }

    public async Task<MultipartUploadInitiateResponseDto> InitiateMultipartUploadAsync(MultipartUploadInitiateDto initiateDto)
    {
        var key = $"{Guid.NewGuid()}_{initiateDto.FileName}";
        var uploadId = await _fileRepository.InitiateMultipartUploadAsync(key, initiateDto.ContentType);
        
        return new MultipartUploadInitiateResponseDto
        {
            UploadId = uploadId,
            Key = key
        };
    }

    public async Task<MultipartUploadPartResponseDto> UploadPartAsync(MultipartUploadPartDto partDto)
    {
        var etag = await _fileRepository.UploadPartAsync(partDto.Key, partDto.UploadId, partDto.PartNumber, partDto.PartStream);
        
        return new MultipartUploadPartResponseDto
        {
            ETag = etag,
            PartNumber = partDto.PartNumber
        };
    }

    public async Task<string> CompleteMultipartUploadAsync(MultipartUploadCompleteDto completeDto)
    {
        return await _fileRepository.CompleteMultipartUploadAsync(completeDto.Key, completeDto.UploadId, completeDto.PartETags);
    }

    public async Task AbortMultipartUploadAsync(string key, string uploadId)
    {
        await _fileRepository.AbortMultipartUploadAsync(key, uploadId);
    }

    public async Task<string> ComputeHashAsync(Stream stream)
    {
        return await _hashService.ComputeSha256HashAsync(stream);
    }

    public async Task<bool> VerifyHashAsync(string hash, Stream stream)
    {
        var computedHash = await _hashService.ComputeSha256HashAsync(stream);
        return string.Equals(hash, computedHash, StringComparison.OrdinalIgnoreCase);
    }
}