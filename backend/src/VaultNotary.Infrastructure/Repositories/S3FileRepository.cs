using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Configuration;

namespace VaultNotary.Infrastructure.Repositories;

public class S3FileRepository : IFileRepository
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _fileKeyPrefix;
    private readonly int _presignedUrlExpirationHours;

    public S3FileRepository(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration.GetSection("Aws:S3:BucketName").Value ?? "vaultnotary-files";
        _fileKeyPrefix = configuration.GetSection("Aws:S3:FileKeyPrefix").Value ?? "files/";
        _presignedUrlExpirationHours = int.Parse(configuration.GetSection("Aws:S3:PresignedUrlExpirationHours").Value ?? "24");
    }

    public async Task<string> UploadAsync(string key, Stream fileStream, string contentType)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            InputStream = fileStream,
            ContentType = contentType,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AWSKMS
        };

        var response = await _s3Client.PutObjectAsync(request);
        return response.ETag;
    }

    public async Task<Stream> DownloadAsync(string key)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = fullKey
        };

        var response = await _s3Client.GetObjectAsync(request);
        return response.ResponseStream;
    }

    public async Task<string> GetPresignedUrlAsync(string key, TimeSpan expiration)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            Expires = DateTime.UtcNow.Add(expiration),
            Verb = HttpVerb.GET
        };

        return await _s3Client.GetPreSignedURLAsync(request);
    }

    public async Task<bool> ExistsAsync(string key)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = fullKey
            };

            await _s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public async Task DeleteAsync(string key)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fullKey
        };

        await _s3Client.DeleteObjectAsync(request);
    }

    public async Task<string> InitiateMultipartUploadAsync(string key, string contentType)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new InitiateMultipartUploadRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            ContentType = contentType,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AWSKMS
        };

        var response = await _s3Client.InitiateMultipartUploadAsync(request);
        return response.UploadId;
    }

    public async Task<string> UploadPartAsync(string key, string uploadId, int partNumber, Stream partStream)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new UploadPartRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            UploadId = uploadId,
            PartNumber = partNumber,
            InputStream = partStream
        };

        var response = await _s3Client.UploadPartAsync(request);
        return response.ETag;
    }

    public async Task<string> CompleteMultipartUploadAsync(string key, string uploadId, List<string> partETags)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var parts = partETags.Select((etag, index) => new PartETag
        {
            PartNumber = index + 1,
            ETag = etag
        }).ToList();

        var request = new CompleteMultipartUploadRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            UploadId = uploadId,
            PartETags = parts
        };

        var response = await _s3Client.CompleteMultipartUploadAsync(request);
        return response.ETag;
    }

    public async Task AbortMultipartUploadAsync(string key, string uploadId)
    {
        var fullKey = $"{_fileKeyPrefix}{key}";
        
        var request = new AbortMultipartUploadRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            UploadId = uploadId
        };

        await _s3Client.AbortMultipartUploadAsync(request);
    }
}