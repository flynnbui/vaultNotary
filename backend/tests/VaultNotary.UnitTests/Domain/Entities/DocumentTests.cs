using FluentAssertions;
using VaultNotary.Domain.Entities;

namespace VaultNotary.UnitTests.Domain.Entities;

public class DocumentTests
{
    [Fact]
    public void Document_ShouldInitialize_WithDefaultValues()
    {
        var document = new Document();

        document.Id.Should().BeEmpty();
        document.Secretary.Should().BeEmpty();
        document.NotaryPublic.Should().BeEmpty();
        document.TransactionCode.Should().BeEmpty();
        document.Description.Should().BeNull();
        document.DocumentType.Should().BeEmpty();
        document.PartyDocumentLinks.Should().BeEmpty();
        document.Files.Should().BeEmpty();
    }

    [Fact]
    public void Document_ShouldSetProperties_Correctly()
    {
        var document = new Document
        {
            Id = "doc123",
            Secretary = "Secretary Name",
            NotaryPublic = "John Notary",
            TransactionCode = "TX123",
            Description = "Test document",
            DocumentType = "Contract",
            CreatedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        document.Id.Should().Be("doc123");
        document.Secretary.Should().Be("Secretary Name");
        document.NotaryPublic.Should().Be("John Notary");
        document.TransactionCode.Should().Be("TX123");
        document.Description.Should().Be("Test document");
        document.DocumentType.Should().Be("Contract");
    }

    [Fact]
    public void Document_ShouldSupport_StringDocumentTypes()
    {
        var document = new Document { DocumentType = "Contract" };
        document.DocumentType.Should().Be("Contract");
        
        document.DocumentType = "Agreement";
        document.DocumentType.Should().Be("Agreement");
    }
}