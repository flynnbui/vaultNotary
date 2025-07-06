using System.Security.Cryptography;
using VaultNotary.Domain.Services;

namespace VaultNotary.Infrastructure.Services;

public class HashService : IHashService
{
    public async Task<string> ComputeSha256HashAsync(Stream stream)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = await sha256.ComputeHashAsync(stream);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public async Task<string> ComputeSha256HashAsync(byte[] data)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = await Task.Run(() => sha256.ComputeHash(data));
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    public bool VerifyHash(string hash, Stream stream)
    {
        var computedHash = ComputeSha256HashAsync(stream).GetAwaiter().GetResult();
        return string.Equals(hash, computedHash, StringComparison.OrdinalIgnoreCase);
    }

    public bool VerifyHash(string hash, byte[] data)
    {
        var computedHash = ComputeSha256HashAsync(data).GetAwaiter().GetResult();
        return string.Equals(hash, computedHash, StringComparison.OrdinalIgnoreCase);
    }
}