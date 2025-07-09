namespace VaultNotary.Application.DTOs;

public class FileUploadDto
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public Stream FileStream { get; set; } = null!;
}

public class FileUploadResponse
{
    public string Id { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class FileDownloadResponse
{
    public string DownloadUrl { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class MultipartUploadInitiateDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

public class MultipartUploadInitiateResponseDto
{
    public string UploadId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
}

public class MultipartUploadPartDto
{
    public string UploadId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public int PartNumber { get; set; }
    public Stream PartStream { get; set; } = null!;
}

public class MultipartUploadPartResponseDto
{
    public string ETag { get; set; } = string.Empty;
    public int PartNumber { get; set; }
}

public class MultipartUploadCompleteDto
{
    public string UploadId { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public List<string> PartETags { get; set; } = new();
}

public class PresignedUrlDto
{
    public string Url { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}