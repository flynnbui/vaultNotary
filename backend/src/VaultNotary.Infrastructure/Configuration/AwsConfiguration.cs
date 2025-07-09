namespace VaultNotary.Infrastructure.Configuration;

public class AwsConfiguration
{
    public string Region { get; set; } = "us-east-1";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public S3Configuration S3 { get; set; } = new();
    public KmsConfiguration Kms { get; set; } = new();
}


public class S3Configuration
{
    public string BucketName { get; set; } = "vaultnotary-files";
    public string FileKeyPrefix { get; set; } = "files/";
    public int PresignedUrlExpirationHours { get; set; } = 24;
}

public class KmsConfiguration
{
    public string SymmetricKeyId { get; set; } = string.Empty;
}