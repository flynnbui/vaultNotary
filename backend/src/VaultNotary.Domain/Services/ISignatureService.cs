namespace VaultNotary.Domain.Services;

public interface ISignatureService
{
    Task<byte[]> SignAsync(byte[] data);
    Task<bool> VerifyAsync(byte[] data, byte[] signature);
}