namespace VaultNotary.Application.Validators;

public static class AllowedFileTypes
{
    public const string PDF = "application/pdf";
    public const string JPEG = "image/jpeg";
    public const string PNG = "image/png";
    public const string GIF = "image/gif";
    public const string DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    public static readonly string[] All = { PDF, JPEG, PNG, GIF, DOCX };

    public static bool IsValid(string contentType)
    {
        return !string.IsNullOrWhiteSpace(contentType) && All.Contains(contentType);
    }

    public static string GetAllowedTypesString()
    {
        return string.Join(", ", All);
    }
}