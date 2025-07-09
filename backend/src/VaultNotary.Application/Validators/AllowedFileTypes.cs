namespace VaultNotary.Application.Validators;

public static class AllowedFileTypes
{
    public const string PDF = "application/pdf";
    public const string JPEG = "image/jpeg";
    public const string PNG = "image/png";
    public const string GIF = "image/gif";
    
    public static readonly string[] All = { PDF, JPEG, PNG, GIF };
    
    public static bool IsValid(string contentType)
    {
        return !string.IsNullOrWhiteSpace(contentType) && All.Contains(contentType);
    }
    
    public static string GetAllowedTypesString()
    {
        return string.Join(", ", All);
    }
    
    public static bool IsPdf(string contentType)
    {
        return contentType == PDF;
    }
    
    public static bool IsImage(string contentType)
    {
        return contentType == JPEG || contentType == PNG || contentType == GIF;
    }
}