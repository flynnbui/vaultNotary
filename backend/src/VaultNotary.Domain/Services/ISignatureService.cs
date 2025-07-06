namespace VaultNotary.Domain.Services;

public interface ISignatureService
{
    Task<string> SignHashAsync(string hash);
    Task<bool> VerifySignatureAsync(string hash, string signature);
    Task<string> GetPublicKeyAsync();
}