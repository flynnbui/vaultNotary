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
    Task<bool> VerifyFileIntegrityAsync(string fileId);
    Task<bool> VerifyFileSignatureAsync(string fileId);
    Task<DocumentFileDto?> GetFileVerificationInfoAsync(string fileId);
    Task<List<DocumentFileDto>> BatchVerifyFilesAsync(List<string> fileIds);
    Task<bool> VerifyFileAgainstHashAsync(string fileId, string expectedHash);
    Task<string> SignFileHashAsync(string fileId, string hash);
}