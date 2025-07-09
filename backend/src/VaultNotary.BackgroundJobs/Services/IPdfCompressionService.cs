namespace VaultNotary.BackgroundJobs.Services;

public interface IPdfCompressionService
{
    Task<byte[]> CompressPdfAsync(byte[] pdfData);
    Task<long> GetCompressedSizeAsync(byte[] pdfData);
}