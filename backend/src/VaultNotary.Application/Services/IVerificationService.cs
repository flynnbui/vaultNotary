using VaultNotary.Application.DTOs;

namespace VaultNotary.Application.Services;

public interface IVerificationService
{
    Task<string> SignDocumentHashAsync(string documentId, string hash);
    Task<bool> VerifyDocumentSignatureAsync(string documentId, string hash, string signature);
    Task<bool> VerifyDocumentIntegrityAsync(string documentId, Stream fileStream);
    Task<DocumentDto?> GetDocumentVerificationInfoAsync(string documentId);
    Task<List<DocumentDto>> BatchVerifyDocumentsAsync(List<string> documentIds);
    Task<string> GetPublicKeyAsync();
}