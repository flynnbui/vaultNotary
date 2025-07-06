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
        document.FileName.Should().BeEmpty();
        document.FileSize.Should().Be(0);
        document.ContentType.Should().BeEmpty();
        document.Sha256Hash.Should().BeEmpty();
        document.Signature.Should().BeNull();
        document.NotaryPublic.Should().BeNull();
        document.DocumentType.Should().Be(DocumentType.Contract);
        document.PartyDocumentLinks.Should().BeEmpty();
    }

    [Fact]
    public void Document_ShouldSetProperties_Correctly()
    {
        var document = new Document
        {
            Id = "doc123",
            FileName = "contract.pdf",
            FileSize = 1024,
            ContentType = "application/pdf",
            Sha256Hash = "abc123hash",
            Signature = "signature123",
            NotaryPublic = "John Notary",
            DocumentType = DocumentType.Contract,
            NotaryDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        document.Id.Should().Be("doc123");
        document.FileName.Should().Be("contract.pdf");
        document.FileSize.Should().Be(1024);
        document.ContentType.Should().Be("application/pdf");
        document.Sha256Hash.Should().Be("abc123hash");
        document.Signature.Should().Be("signature123");
        document.NotaryPublic.Should().Be("John Notary");
        document.DocumentType.Should().Be(DocumentType.Contract);
    }

    [Fact]
    public void DocumentType_ShouldHave_CorrectValues()
    {
        DocumentType.Contract.Should().Be(DocumentType.Contract);
        DocumentType.Agreement.Should().Be(DocumentType.Agreement);
        DocumentType.Certificate.Should().Be(DocumentType.Certificate);
        DocumentType.Identity.Should().Be(DocumentType.Identity);
        DocumentType.Other.Should().Be(DocumentType.Other);
    }
}