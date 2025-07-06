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
    private readonly string _asymmetricKeyId;

    public KmsSignatureService(IAmazonKeyManagementService kmsClient, IConfiguration configuration)
    {
        _kmsClient = kmsClient;
        _asymmetricKeyId = configuration.GetSection("Aws:Kms:AsymmetricKeyId").Value ?? throw new InvalidOperationException("AsymmetricKeyId is required");
    }

    public async Task<string> SignHashAsync(string hash)
    {
        var hashBytes = Convert.FromHexString(hash);
        
        var request = new SignRequest
        {
            KeyId = _asymmetricKeyId,
            Message = new MemoryStream(hashBytes),
            MessageType = MessageType.DIGEST,
            SigningAlgorithm = SigningAlgorithmSpec.RSASSA_PKCS1_V1_5_SHA_256
        };

        var response = await _kmsClient.SignAsync(request);
        return Convert.ToBase64String(response.Signature.ToArray());
    }

    public async Task<bool> VerifySignatureAsync(string hash, string signature)
    {
        var hashBytes = Convert.FromHexString(hash);
        var signatureBytes = Convert.FromBase64String(signature);
        
        var request = new VerifyRequest
        {
            KeyId = _asymmetricKeyId,
            Message = new MemoryStream(hashBytes),
            MessageType = MessageType.DIGEST,
            Signature = new MemoryStream(signatureBytes),
            SigningAlgorithm = SigningAlgorithmSpec.RSASSA_PKCS1_V1_5_SHA_256
        };

        var response = await _kmsClient.VerifyAsync(request);
        return response.SignatureValid ?? false;
    }

    public async Task<string> GetPublicKeyAsync()
    {
        var request = new GetPublicKeyRequest
        {
            KeyId = _asymmetricKeyId
        };

        var response = await _kmsClient.GetPublicKeyAsync(request);
        return Convert.ToBase64String(response.PublicKey.ToArray());
    }
}