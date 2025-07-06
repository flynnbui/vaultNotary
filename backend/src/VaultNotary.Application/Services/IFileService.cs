using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface IFileService
{
    Task<string> UploadAsync(FileUploadDto fileUploadDto);
    Task<Stream> DownloadAsync(string key);
    Task<PresignedUrlDto> GetPresignedUrlAsync(string key, TimeSpan expiration);
    Task<bool> ExistsAsync(string key);
    Task DeleteAsync(string key);
    Task<MultipartUploadInitiateResponseDto> InitiateMultipartUploadAsync(MultipartUploadInitiateDto initiateDto);
    Task<MultipartUploadPartResponseDto> UploadPartAsync(MultipartUploadPartDto partDto);
    Task<string> CompleteMultipartUploadAsync(MultipartUploadCompleteDto completeDto);
    Task AbortMultipartUploadAsync(string key, string uploadId);
    Task<string> ComputeHashAsync(Stream stream);
    Task<bool> VerifyHashAsync(string hash, Stream stream);
}