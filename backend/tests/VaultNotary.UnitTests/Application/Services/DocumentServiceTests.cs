using FluentAssertions;
using Moq;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.UnitTests.Application.Services;

public class DocumentServiceTests
{
    private readonly Mock<IDocumentRepository> _mockDocumentRepository;
    private readonly Mock<IPartyDocumentRepository> _mockPartyDocumentRepository;
    private readonly Mock<ICustomerRepository> _mockCustomerRepository;
    private readonly Mock<IDocumentFileService> _mockDocumentFileService;
    private readonly DocumentService _documentService;

    public DocumentServiceTests()
    {
        _mockDocumentRepository = new Mock<IDocumentRepository>();
        _mockPartyDocumentRepository = new Mock<IPartyDocumentRepository>();
        _mockCustomerRepository = new Mock<ICustomerRepository>();
        _mockDocumentFileService = new Mock<IDocumentFileService>();

        _documentService = new DocumentService(
            _mockDocumentRepository.Object,
            _mockPartyDocumentRepository.Object,
            _mockCustomerRepository.Object,
            _mockDocumentFileService.Object);
    }

    [Fact]
    public async Task UpdateAsync_ShouldAddNewParties_WhenPartiesNotInCurrent()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Old Secretary",
            NotaryPublic = "Old Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var currentParties = new List<PartyDocumentLink>
        {
            new() { DocumentId = documentId, CustomerId = "customer1", PartyRole = PartyRole.PartyA }
        };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "New Secretary",
            NotaryPublic = "New Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "customer1", PartyRole = PartyRole.PartyA }, // Keep existing
                new() { CustomerId = "customer2", PartyRole = PartyRole.PartyB }  // Add new
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(currentParties);

        _mockCustomerRepository.Setup(r => r.ExistsAsync("customer1")).ReturnsAsync(true);
        _mockCustomerRepository.Setup(r => r.ExistsAsync("customer2")).ReturnsAsync(true);

        // Act
        await _documentService.UpdateAsync(documentId, updateDto);

        // Assert
        _mockDocumentRepository.Verify(r => r.UpdateAsync(It.IsAny<Document>()), Times.Once);
        _mockPartyDocumentRepository.Verify(r => r.CreateAsync(It.Is<PartyDocumentLink>(p => 
            p.CustomerId == "customer2" && p.PartyRole == PartyRole.PartyB)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateExistingPartyRole_WhenRoleChanged()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var existingParty = new PartyDocumentLink
        {
            DocumentId = documentId,
            CustomerId = "customer1",
            PartyRole = PartyRole.PartyA
        };

        var currentParties = new List<PartyDocumentLink> { existingParty };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "customer1", PartyRole = PartyRole.PartyB } // Changed role
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(currentParties);

        _mockCustomerRepository.Setup(r => r.ExistsAsync("customer1")).ReturnsAsync(true);

        // Act
        await _documentService.UpdateAsync(documentId, updateDto);

        // Assert
        _mockPartyDocumentRepository.Verify(r => r.UpdateAsync(It.Is<PartyDocumentLink>(p => 
            p.CustomerId == "customer1" && p.PartyRole == PartyRole.PartyB)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldRemoveParties_WhenNotInDesiredState()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var currentParties = new List<PartyDocumentLink>
        {
            new() { DocumentId = documentId, CustomerId = "customer1", PartyRole = PartyRole.PartyA },
            new() { DocumentId = documentId, CustomerId = "customer2", PartyRole = PartyRole.PartyB }
        };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "customer1", PartyRole = PartyRole.PartyA } // Keep only customer1
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(currentParties);

        _mockCustomerRepository.Setup(r => r.ExistsAsync("customer1")).ReturnsAsync(true);

        // Act
        await _documentService.UpdateAsync(documentId, updateDto);

        // Assert
        _mockPartyDocumentRepository.Verify(r => r.DeleteAsync(documentId, "customer2"), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowException_WhenCustomerDoesNotExist()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "nonexistent", PartyRole = PartyRole.PartyA }
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(new List<PartyDocumentLink>());

        _mockCustomerRepository.Setup(r => r.ExistsAsync("nonexistent")).ReturnsAsync(false);

        // Act & Assert
        await FluentActions.Invoking(() => _documentService.UpdateAsync(documentId, updateDto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Customer with ID 'nonexistent' does not exist.");
    }

    [Fact]
    public async Task UpdateAsync_ShouldHandleMixedOperations_AddUpdateRemove()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var currentParties = new List<PartyDocumentLink>
        {
            new() { DocumentId = documentId, CustomerId = "customer1", PartyRole = PartyRole.PartyA },
            new() { DocumentId = documentId, CustomerId = "customer2", PartyRole = PartyRole.PartyB },
            new() { DocumentId = documentId, CustomerId = "customer3", PartyRole = PartyRole.PartyC }
        };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Updated Secretary",
            NotaryPublic = "Updated Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "customer1", PartyRole = PartyRole.PartyA }, // Keep unchanged
                new() { CustomerId = "customer2", PartyRole = PartyRole.PartyC }, // Update role
                new() { CustomerId = "customer4", PartyRole = PartyRole.PartyB }  // Add new
                // customer3 not included = will be removed
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(currentParties);

        _mockCustomerRepository.Setup(r => r.ExistsAsync(It.IsAny<string>())).ReturnsAsync(true);

        // Act
        await _documentService.UpdateAsync(documentId, updateDto);

        // Assert
        // Verify document update
        _mockDocumentRepository.Verify(r => r.UpdateAsync(It.Is<Document>(d => 
            d.Secretary == "Updated Secretary" && d.NotaryPublic == "Updated Notary")), Times.Once);

        // Verify party operations
        _mockPartyDocumentRepository.Verify(r => r.CreateAsync(It.Is<PartyDocumentLink>(p => 
            p.CustomerId == "customer4" && p.PartyRole == PartyRole.PartyB)), Times.Once);

        _mockPartyDocumentRepository.Verify(r => r.UpdateAsync(It.Is<PartyDocumentLink>(p => 
            p.CustomerId == "customer2" && p.PartyRole == PartyRole.PartyC)), Times.Once);

        _mockPartyDocumentRepository.Verify(r => r.DeleteAsync(documentId, "customer3"), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldSetCorrectSignatureStatus_ForNewParties()
    {
        // Arrange
        var documentId = "doc123";
        var existingDocument = new Document
        {
            Id = documentId,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng"
        };

        var updateDto = new UpdateDocumentDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Secretary",
            NotaryPublic = "Notary",
            TransactionCode = "TX123",
            DocumentType = "Hợp đồng",
            Parties = new List<CreatePartyDocumentLinkDto>
            {
                new() { CustomerId = "customer1", PartyRole = PartyRole.PartyA }
            }
        };

        _mockDocumentRepository.Setup(r => r.GetByIdAsync(documentId))
            .ReturnsAsync(existingDocument);

        _mockPartyDocumentRepository.Setup(r => r.GetByDocumentIdAsync(documentId))
            .ReturnsAsync(new List<PartyDocumentLink>());

        _mockCustomerRepository.Setup(r => r.ExistsAsync("customer1")).ReturnsAsync(true);

        // Act
        await _documentService.UpdateAsync(documentId, updateDto);

        // Assert
        _mockPartyDocumentRepository.Verify(r => r.CreateAsync(It.Is<PartyDocumentLink>(p => 
            p.CustomerId == "customer1" && 
            p.PartyRole == PartyRole.PartyA && 
            p.SignatureStatus == SignatureStatus.Pending)), Times.Once);
    }
}