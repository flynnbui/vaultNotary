namespace VaultNotary.Infrastructure.Jobs;

public class CompressFileJob
{
    public string FileKey { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}