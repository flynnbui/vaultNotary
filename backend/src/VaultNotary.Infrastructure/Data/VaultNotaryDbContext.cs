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

        // Configure column names for snake_case database
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
}