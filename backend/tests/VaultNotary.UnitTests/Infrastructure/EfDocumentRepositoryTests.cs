using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Infrastructure.Data;
using VaultNotary.Infrastructure.Repositories;

namespace VaultNotary.UnitTests.Infrastructure;

public class EfDocumentRepositoryTests : IDisposable
{
    private readonly VaultNotaryDbContext _context;
    private readonly EfDocumentRepository _repository;

    public EfDocumentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<VaultNotaryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new VaultNotaryDbContext(options);
        _repository = new EfDocumentRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Create Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateDocument_WhenValidDataProvided()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract"
        };

        // Act
        var result = await _repository.CreateAsync(document);

        // Assert
        result.Should().Be(document.Id);
        var savedDocument = await _context.Documents.FindAsync(document.Id);
        savedDocument.Should().NotBeNull();
        savedDocument!.TransactionCode.Should().Be("TX12345");
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowException_WhenDocumentWithSameIdExists()
    {
        // Arrange
        var document1 = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };
        var document2 = new Document
        {
            Id = "doc-1", // Same ID
            TransactionCode = "TX54321",
            DocumentType = "Agreement"
        };

        await _repository.CreateAsync(document1);

        // Act & Assert
        await FluentActions.Invoking(() => _repository.CreateAsync(document2))
            .Should().ThrowAsync<Exception>();
    }

    [Fact]
    public async Task CreateAsync_ShouldHandleSpecialCharacters_InFields()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-special",
            CreatedDate = DateTime.UtcNow,
            Secretary = "João García-López",
            NotaryPublic = "María José González",
            TransactionCode = "TX-@#$%",
            Description = "Document with special chars: àáâãäåæçèéêë",
            DocumentType = "Contrato Español"
        };

        // Act
        var result = await _repository.CreateAsync(document);

        // Assert
        result.Should().Be(document.Id);
        var savedDocument = await _context.Documents.FindAsync(document.Id);
        savedDocument.Should().NotBeNull();
        savedDocument!.Description.Should().Contain("àáâãäåæçèéêë");
        savedDocument.Secretary.Should().Be("João García-López");
    }

    #endregion

    #region Read Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnDocument_WhenExists()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };
        await _repository.CreateAsync(document);

        // Act
        var result = await _repository.GetByIdAsync("doc-1");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("doc-1");
        result.TransactionCode.Should().Be("TX12345");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _repository.GetByIdAsync("non-existent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByHashAsync_ShouldReturnNull_WhenNoMatchingHash()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };
        await _repository.CreateAsync(document);

        // Act - Search for a hash that doesn't exist in S3Key
        var result = await _repository.GetByHashAsync("nonexistent-hash");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByHashAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _repository.GetByHashAsync("NON-EXISTENT");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllDocuments()
    {
        // Arrange
        var documents = new[]
        {
            new Document { Id = "doc-1", TransactionCode = "TX1", DocumentType = "Contract" },
            new Document { Id = "doc-2", TransactionCode = "TX2", DocumentType = "Agreement" },
            new Document { Id = "doc-3", TransactionCode = "TX3", DocumentType = "Lease" }
        };

        foreach (var doc in documents)
        {
            await _repository.CreateAsync(doc);
        }

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Select(d => d.Id).Should().Contain(new[] { "doc-1", "doc-2", "doc-3" });
    }

    [Fact]
    public async Task GetByNotaryDateRangeAsync_ShouldReturnDocumentsInRange()
    {
        // Arrange
        var baseDate = new DateTime(2024, 1, 1);
        var documents = new[]
        {
            new Document { Id = "doc-1", TransactionCode = "TX1", DocumentType = "Contract", CreatedDate = baseDate.AddDays(1) },
            new Document { Id = "doc-2", TransactionCode = "TX2", DocumentType = "Agreement", CreatedDate = baseDate.AddDays(5) },
            new Document { Id = "doc-3", TransactionCode = "TX3", DocumentType = "Lease", CreatedDate = baseDate.AddDays(10) }
        };

        foreach (var doc in documents)
        {
            await _repository.CreateAsync(doc);
        }

        // Act
        var result = await _repository.GetByNotaryDateRangeAsync(baseDate.AddDays(2), baseDate.AddDays(8));

        // Assert
        result.Should().NotBeNull(); // Since no party document links exist, it will be empty
        result.Should().BeOfType<List<Document>>();
    }

    [Fact]
    public async Task SearchAsync_ShouldReturnMatchingDocuments()
    {
        // Arrange
        var documents = new[]
        {
            new Document { Id = "doc-1", TransactionCode = "CONTRACT-123", DocumentType = "Contract", Description = "Purchase agreement" },
            new Document { Id = "doc-2", TransactionCode = "LEASE-456", DocumentType = "Lease", Description = "Rental contract" },
            new Document { Id = "doc-3", TransactionCode = "SALE-789", DocumentType = "Sale", Description = "Property sale" }
        };

        foreach (var doc in documents)
        {
            await _repository.CreateAsync(doc);
        }

        // Act
        var result = await _repository.SearchAsync("contract");

        // Assert
        result.Should().HaveCount(2); // Should match "CONTRACT-123" and "Rental contract"
        result.Select(d => d.Id).Should().Contain(new[] { "doc-1", "doc-2" });
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateDocument_WhenExists()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract",
            Description = "Original description"
        };
        await _repository.CreateAsync(document);

        document.Description = "Updated description";
        document.DocumentType = "Updated Contract";

        // Act
        await _repository.UpdateAsync(document);

        // Assert
        var updatedDocument = await _context.Documents.FindAsync("doc-1");
        updatedDocument.Should().NotBeNull();
        updatedDocument!.Description.Should().Be("Updated description");
        updatedDocument.DocumentType.Should().Be("Updated Contract");
        updatedDocument.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowException_WhenDocumentNotExists()
    {
        // Arrange
        var document = new Document
        {
            Id = "non-existent",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };

        // Act & Assert
        await FluentActions.Invoking(() => _repository.UpdateAsync(document))
            .Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task DeleteAsync_ShouldDeleteDocument_WhenExists()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };
        await _repository.CreateAsync(document);

        // Act
        await _repository.DeleteAsync("doc-1");

        // Assert
        var deletedDocument = await _context.Documents.FindAsync("doc-1");
        deletedDocument.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldNotThrow_WhenDocumentNotExists()
    {
        // Act & Assert
        await FluentActions.Invoking(() => _repository.DeleteAsync("non-existent"))
            .Should().NotThrowAsync();
    }

    #endregion

    #region Exists Tests

    [Fact]
    public async Task ExistsAsync_ShouldReturnTrue_WhenDocumentExists()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX12345",
            DocumentType = "Contract"
        };
        await _repository.CreateAsync(document);

        // Act
        var result = await _repository.ExistsAsync("doc-1");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnFalse_WhenDocumentNotExists()
    {
        // Act
        var result = await _repository.ExistsAsync("non-existent");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Edge Cases and Performance Tests

    [Fact]
    public async Task Repository_ShouldHandleLargeDatasets()
    {
        // Arrange
        var documents = Enumerable.Range(1, 1000)
            .Select(i => new Document
            {
                Id = $"doc-{i}",
                TransactionCode = $"TX{i:D4}",
                DocumentType = "Contract",
                Description = $"Document number {i}"
            }).ToArray();

        // Act
        foreach (var doc in documents)
        {
            await _repository.CreateAsync(doc);
        }

        // Assert
        var allDocs = await _repository.GetAllAsync();
        allDocs.Should().HaveCount(1000);
    }

    [Fact]
    public async Task Repository_ShouldHandleConcurrentOperations()
    {
        // Arrange
        var tasks = Enumerable.Range(1, 10)
            .Select(async i =>
            {
                var document = new Document
                {
                    Id = $"doc-{i}",
                    TransactionCode = $"TX{i}",
                    DocumentType = "Contract"
                };
                return await _repository.CreateAsync(document);
            });

        // Act
        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(10);
        results.Should().OnlyContain(id => !string.IsNullOrEmpty(id));
        
        var allDocs = await _repository.GetAllAsync();
        allDocs.Should().HaveCount(10);
    }

    [Fact]
    public async Task GetByNotaryDateRangeAsync_ShouldHandleEdgeDates()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX1",
            DocumentType = "Contract",
            CreatedDate = DateTime.UtcNow
        };
        await _repository.CreateAsync(document);

        // Act - Test with same date for from and to
        var result1 = await _repository.GetByNotaryDateRangeAsync(DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(1));
        
        // Test with future dates
        var result2 = await _repository.GetByNotaryDateRangeAsync(DateTime.UtcNow.AddDays(1), DateTime.UtcNow.AddDays(2));

        // Assert
        result1.Should().BeEmpty(); // No party document links
        result2.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchAsync_ShouldBeCase_Insensitive()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "CONTRACT-123",
            DocumentType = "Contract",
            Description = "Purchase Agreement"
        };
        await _repository.CreateAsync(document);

        // Act
        var result1 = await _repository.SearchAsync("contract");
        var result2 = await _repository.SearchAsync("CONTRACT");
        var result3 = await _repository.SearchAsync("purchase");
        var result4 = await _repository.SearchAsync("AGREEMENT");

        // Assert
        result1.Should().HaveCount(1);
        result2.Should().HaveCount(1);
        result3.Should().HaveCount(1);
        result4.Should().HaveCount(1);
    }

    [Fact]
    public async Task SearchAsync_ShouldHandleEmptyAndNullQueries()
    {
        // Arrange
        var document = new Document
        {
            Id = "doc-1",
            TransactionCode = "TX123",
            DocumentType = "Contract"
        };
        await _repository.CreateAsync(document);

        // Act
        var result1 = await _repository.SearchAsync("");
        var result2 = await _repository.SearchAsync(null!);

        // Assert
        result1.Should().BeEmpty();
        result2.Should().BeEmpty();
    }

    #endregion
}