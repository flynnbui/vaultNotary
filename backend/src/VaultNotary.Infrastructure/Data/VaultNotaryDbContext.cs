using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;

namespace VaultNotary.Infrastructure.Data;

public class VaultNotaryDbContext : DbContext
{
    public VaultNotaryDbContext(DbContextOptions<VaultNotaryDbContext> options) : base(options)
    {
    }

    public DbSet<Document> Documents { get; set; } = null!;
    public DbSet<DocumentFile> Files { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<PartyDocumentLink> PartyDocumentLinks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure PartyDocumentLink composite primary key
        modelBuilder.Entity<PartyDocumentLink>()
            .HasKey(pdl => new { pdl.DocumentId, pdl.CustomerId });

        // Configure table names explicitly 
        modelBuilder.Entity<DocumentFile>()
            .ToTable("document_files");

        // Configure all entity table names to match snake_case database
        modelBuilder.Entity<Document>()
            .ToTable("documents");

        modelBuilder.Entity<Customer>()
            .ToTable("customers");

        modelBuilder.Entity<PartyDocumentLink>()
            .ToTable("party_document_links");

        // Configure column names for snake_case database
        ConfigureDocumentFileColumns(modelBuilder);
        ConfigureDocumentColumns(modelBuilder);
        ConfigureCustomerColumns(modelBuilder);
        ConfigurePartyDocumentLinkColumns(modelBuilder);

        // Configure Document relationships
        modelBuilder.Entity<Document>()
            .HasMany(d => d.Files)
            .WithOne(f => f.Document)
            .HasForeignKey(f => f.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Document>()
            .HasMany(d => d.PartyDocumentLinks)
            .WithOne(pdl => pdl.Document)
            .HasForeignKey(pdl => pdl.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Customer relationships
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.PartyDocumentLinks)
            .WithOne(pdl => pdl.Customer)
            .HasForeignKey(pdl => pdl.CustomerId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if customer has documents

        // Configure unique constraints
        modelBuilder.Entity<Document>()
            .HasIndex(d => d.TransactionCode)
            .IsUnique();

        // Configure enum conversions
        modelBuilder.Entity<Customer>()
            .Property(c => c.Type)
            .HasConversion<string>();

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.PartyRole)
            .HasConversion<string>();

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.SignatureStatus)
            .HasConversion<string>();

        // Configure default values for timestamps
        modelBuilder.Entity<Document>()
            .Property(d => d.CreatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<Document>()
            .Property(d => d.UpdatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.CreatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.UpdatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<Customer>()
            .Property(c => c.CreatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<Customer>()
            .Property(c => c.UpdatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.CreatedAt)
            .HasDefaultValueSql("NOW()");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.UpdatedAt)
            .HasDefaultValueSql("NOW()");
    }

    private void ConfigureDocumentFileColumns(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.DocumentId)
            .HasColumnName("document_id");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.FileName)
            .HasColumnName("file_name");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.FileSize)
            .HasColumnName("file_size");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.ContentType)
            .HasColumnName("content_type");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.S3Key)
            .HasColumnName("s3_key");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.S3Bucket)
            .HasColumnName("s3_bucket");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.CreatedAt)
            .HasColumnName("created_at");

        modelBuilder.Entity<DocumentFile>()
            .Property(f => f.UpdatedAt)
            .HasColumnName("updated_at");
    }

    private void ConfigureDocumentColumns(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>()
            .Property(d => d.CreatedDate)
            .HasColumnName("created_date");

        modelBuilder.Entity<Document>()
            .Property(d => d.NotaryPublic)
            .HasColumnName("notary_public");

        modelBuilder.Entity<Document>()
            .Property(d => d.TransactionCode)
            .HasColumnName("transaction_code");

        modelBuilder.Entity<Document>()
            .Property(d => d.DocumentType)
            .HasColumnName("document_type");

        modelBuilder.Entity<Document>()
            .Property(d => d.CreatedAt)
            .HasColumnName("created_at");

        modelBuilder.Entity<Document>()
            .Property(d => d.UpdatedAt)
            .HasColumnName("updated_at");
    }

    private void ConfigureCustomerColumns(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .Property(c => c.FullName)
            .HasColumnName("full_name");

        modelBuilder.Entity<Customer>()
            .Property(c => c.DocumentId)
            .HasColumnName("document_id");

        modelBuilder.Entity<Customer>()
            .Property(c => c.PassportId)
            .HasColumnName("passport_id");

        modelBuilder.Entity<Customer>()
            .Property(c => c.BusinessRegistrationNumber)
            .HasColumnName("business_registration_number");

        modelBuilder.Entity<Customer>()
            .Property(c => c.BusinessName)
            .HasColumnName("business_name");

        modelBuilder.Entity<Customer>()
            .Property(c => c.CreatedAt)
            .HasColumnName("created_at");

        modelBuilder.Entity<Customer>()
            .Property(c => c.UpdatedAt)
            .HasColumnName("updated_at");
    }

    private void ConfigurePartyDocumentLinkColumns(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.DocumentId)
            .HasColumnName("document_id");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.CustomerId)
            .HasColumnName("customer_id");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.PartyRole)
            .HasColumnName("party_role");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.SignatureStatus)
            .HasColumnName("signature_status");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.NotaryDate)
            .HasColumnName("notary_date");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.CreatedAt)
            .HasColumnName("created_at");

        modelBuilder.Entity<PartyDocumentLink>()
            .Property(pdl => pdl.UpdatedAt)
            .HasColumnName("updated_at");
    }
}