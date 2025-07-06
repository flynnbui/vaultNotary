namespace VaultNotary.Domain.Services;

public interface IHashService
{
    Task<string> ComputeSha256HashAsync(Stream stream);
    Task<string> ComputeSha256HashAsync(byte[] data);
    bool VerifyHash(string hash, Stream stream);
    bool VerifyHash(string hash, byte[] data);
}