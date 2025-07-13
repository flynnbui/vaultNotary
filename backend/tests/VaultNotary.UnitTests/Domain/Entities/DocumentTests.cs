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
        document.DocumentType.Should().Be(string.Empty);
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
            DocumentType = "Hợp đồng",
            CreatedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        document.Id.Should().Be("doc123");
        document.Secretary.Should().Be("Secretary Name");
        document.NotaryPublic.Should().Be("John Notary");
        document.TransactionCode.Should().Be("TX123");
        document.Description.Should().Be("Test document");
        document.DocumentType.Should().Be("Hợp đồng");
    }

    [Fact]
    public void Document_ShouldSupport_StringDocumentTypes()
    {
        var document = new Document { DocumentType = "Hợp đồng" };
        document.DocumentType.Should().Be("Hợp đồng");
        
        document.DocumentType = "Thừa kế";
        document.DocumentType.Should().Be("Thừa kế");
    }
}