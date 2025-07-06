namespace VaultNotary.Domain.Repositories;

public interface IFileRepository
{
    Task<string> UploadAsync(string key, Stream fileStream, string contentType);
    Task<Stream> DownloadAsync(string key);
    Task<string> GetPresignedUrlAsync(string key, TimeSpan expiration);
    Task<bool> ExistsAsync(string key);
    Task DeleteAsync(string key);
    Task<string> InitiateMultipartUploadAsync(string key, string contentType);
    Task<string> UploadPartAsync(string key, string uploadId, int partNumber, Stream partStream);
    Task<string> CompleteMultipartUploadAsync(string key, string uploadId, List<string> partETags);
    Task AbortMultipartUploadAsync(string key, string uploadId);
}