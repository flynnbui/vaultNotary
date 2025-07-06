namespace VaultNotary.Web.Authorization;

public static class Permissions
{
    // Customer permissions
    public const string ReadCustomers = "read:customers";
    public const string CreateCustomers = "create:customers";
    public const string UpdateCustomers = "update:customers";
    public const string DeleteCustomers = "delete:customers";
    
    // Document permissions
    public const string ReadDocuments = "read:documents";
    public const string CreateDocuments = "create:documents";
    public const string UpdateDocuments = "update:documents";
    public const string DeleteDocuments = "delete:documents";
    
    // File permissions
    public const string UploadFiles = "upload:files";
    public const string DownloadFiles = "download:files";
    public const string DeleteFiles = "delete:files";
    
    // Search permissions
    public const string SearchDocuments = "search:documents";
    public const string SearchCustomers = "search:customers";
    
    // Verification permissions
    public const string VerifyDocuments = "verify:documents";
    public const string SignDocuments = "sign:documents";
    
    // Admin permissions
    public const string AdminAccess = "admin:access";
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string NotaryPublic = "NotaryPublic";
    public const string User = "User";
    public const string Viewer = "Viewer";
}