using Amazon.KeyManagementService;
using Amazon.KeyManagementService.Model;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using VaultNotary.Domain.Services;

namespace VaultNotary.Infrastructure.Services;

public class KmsSignatureService : ISignatureService
{
    private readonly IAmazonKeyManagementService _kmsClient;
    private readonly string _keyId;

    public KmsSignatureService(IAmazonKeyManagementService kmsClient, string keyId)
    {
        _kmsClient = kmsClient;
        _keyId = keyId;
    }

    public async Task<byte[]> SignAsync(byte[] data)
    {
        var request = new SignRequest
        {
            KeyId = _keyId,
            Message = new MemoryStream(data),
            SigningAlgorithm = SigningAlgorithmSpec.RSASSA_PKCS1_V1_5_SHA_256
        };

        var response = await _kmsClient.SignAsync(request);
        return response.Signature.ToArray();
    }

    public async Task<bool> VerifyAsync(byte[] data, byte[] signature)
    {
        var request = new VerifyRequest
        {
            KeyId = _keyId,
            Message = new MemoryStream(data),
            Signature = new MemoryStream(signature),
            SigningAlgorithm = SigningAlgorithmSpec.RSASSA_PKCS1_V1_5_SHA_256
        };

        try
        {
            var response = await _kmsClient.VerifyAsync(request);
            return response.SignatureValid;
        }
        catch (KMSInvalidSignatureException)
        {
            return false;
        }
    }

    public async Task<string> GetPublicKeyAsync()
    {
        var request = new GetPublicKeyRequest
        {
            KeyId = _keyId
        };

        var response = await _kmsClient.GetPublicKeyAsync(request);
        return Convert.ToBase64String(response.PublicKey.ToArray());
    }
}