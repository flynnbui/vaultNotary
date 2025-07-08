using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Net;
using System.Text;
using System.Text.Json;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Domain.Entities;

namespace VaultNotary.IntegrationTests.Controllers;

public class FilesControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<IDocumentService> _mockDocumentService;

    public FilesControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockDocumentService = new Mock<IDocumentService>();
        
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var documentServiceDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IDocumentService));
                if (documentServiceDescriptor != null)
                {
                    services.Remove(documentServiceDescriptor);
                }
                services.AddScoped(_ => _mockDocumentService.Object);
            });
            
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    #region CreateFile Tests

    [Fact]
    public async Task CreateFile_ShouldReturnOk_WhenValidDataProvided()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract",
            Parties = new PartiesDto
            {
                A = new List<PartyMemberDto> { new() { Id = "party-a-1", Name = "Party A", NotaryDate = DateTime.UtcNow } },
                B = new List<PartyMemberDto> { new() { Id = "party-b-1", Name = "Party B", NotaryDate = DateTime.UtcNow } }
            }
        };

        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ReturnsAsync(documentId);
        _mockDocumentService.Setup(s => s.LinkPartyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CreatePartyDocumentLinkDto>()))
            .Returns(Task.CompletedTask);

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain(documentId);

        _mockDocumentService.Verify(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()), Times.Once);
        _mockDocumentService.Verify(s => s.LinkPartyAsync(documentId, "party-a-1", It.IsAny<CreatePartyDocumentLinkDto>()), Times.Once);
        _mockDocumentService.Verify(s => s.LinkPartyAsync(documentId, "party-b-1", It.IsAny<CreatePartyDocumentLinkDto>()), Times.Once);
    }

    [Fact]
    public async Task CreateFile_ShouldReturnBadRequest_WhenDtoIsNull()
    {
        // Act
        var response = await _client.PostAsync("/api/files", new StringContent("null", Encoding.UTF8, "application/json"));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("CreateFileDto cannot be null");
    }

    [Fact]
    public async Task CreateFile_ShouldReturnBadRequest_WhenTransactionCodeIsEmpty()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "", // Empty transaction code
            Description = "Test document",
            DocumentType = "Contract"
        };

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("TransactionCode is required");
    }

    [Fact]
    public async Task CreateFile_ShouldReturnBadRequest_WhenDocumentTypeIsEmpty()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "" // Empty document type
        };

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("DocumentType is required");
    }

    [Fact]
    public async Task CreateFile_ShouldReturnInternalServerError_WhenServiceThrowsException()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract"
        };

        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ThrowsAsync(new Exception("Database error"));

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("An error occurred while creating the file");
    }

    #endregion

    #region GetFile Tests

    [Fact]
    public async Task GetFile_ShouldReturnOk_WhenDocumentExists()
    {
        // Arrange
        var documentId = "doc-123";
        var document = new DocumentDto
        {
            Id = documentId,
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract"
        };

        _mockDocumentService.Setup(s => s.GetByIdAsync(documentId))
            .ReturnsAsync(document);

        // Act
        var response = await _client.GetAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var responseContent = await response.Content.ReadAsStringAsync();
        var returnedDocument = JsonSerializer.Deserialize<DocumentDto>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        returnedDocument.Should().NotBeNull();
        returnedDocument!.Id.Should().Be(documentId);
    }

    [Fact]
    public async Task GetFile_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        // Arrange
        var documentId = "non-existent-doc";
        _mockDocumentService.Setup(s => s.GetByIdAsync(documentId))
            .ReturnsAsync((DocumentDto?)null);

        // Act
        var response = await _client.GetAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain($"Document with ID '{documentId}' not found");
    }

    [Fact]
    public async Task GetFile_ShouldReturnBadRequest_WhenIdIsEmpty()
    {
        // Act
        var response = await _client.GetAsync("/api/files/ ");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetFile_ShouldReturnInternalServerError_WhenServiceThrowsException()
    {
        // Arrange
        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.GetByIdAsync(documentId))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var response = await _client.GetAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("An error occurred while retrieving the file");
    }

    #endregion

    #region UpdateFile Tests

    [Fact]
    public async Task UpdateFile_ShouldReturnNoContent_WhenValidDataProvided()
    {
        // Arrange
        var documentId = "doc-123";
        var updateFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "Updated Secretary",
            NotaryPublic = "Updated Notary",
            TransactionCode = "TX54321",
            Description = "Updated description",
            DocumentType = "Updated Contract"
        };

        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(true);
        _mockDocumentService.Setup(s => s.UpdateAsync(documentId, It.IsAny<UpdateDocumentDto>()))
            .Returns(Task.CompletedTask);

        var json = JsonSerializer.Serialize(updateFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/files/{documentId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        _mockDocumentService.Verify(s => s.UpdateAsync(documentId, It.IsAny<UpdateDocumentDto>()), Times.Once);
    }

    [Fact]
    public async Task UpdateFile_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        // Arrange
        var documentId = "non-existent-doc";
        var updateFileDto = new CreateFileDto
        {
            TransactionCode = "TX54321",
            DocumentType = "Contract"
        };

        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(false);

        var json = JsonSerializer.Serialize(updateFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/files/{documentId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain($"Document with ID '{documentId}' not found");
    }

    [Fact]
    public async Task UpdateFile_ShouldReturnBadRequest_WhenIdIsEmpty()
    {
        // Arrange
        var updateFileDto = new CreateFileDto
        {
            TransactionCode = "TX54321",
            DocumentType = "Contract"
        };

        var json = JsonSerializer.Serialize(updateFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync("/api/files/ ", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DeleteFile Tests

    [Fact]
    public async Task DeleteFile_ShouldReturnNoContent_WhenDocumentExists()
    {
        // Arrange
        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(true);
        _mockDocumentService.Setup(s => s.DeleteAsync(documentId))
            .Returns(Task.CompletedTask);

        // Act
        var response = await _client.DeleteAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        _mockDocumentService.Verify(s => s.DeleteAsync(documentId), Times.Once);
    }

    [Fact]
    public async Task DeleteFile_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        // Arrange
        var documentId = "non-existent-doc";
        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(false);

        // Act
        var response = await _client.DeleteAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain($"Document with ID '{documentId}' not found");
    }

    [Fact]
    public async Task DeleteFile_ShouldReturnBadRequest_WhenIdIsEmpty()
    {
        // Act
        var response = await _client.DeleteAsync("/api/files/ ");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteFile_ShouldReturnInternalServerError_WhenServiceThrowsException()
    {
        // Arrange
        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(true);
        _mockDocumentService.Setup(s => s.DeleteAsync(documentId))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var response = await _client.DeleteAsync($"/api/files/{documentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("An error occurred while deleting the file");
    }

    #endregion

    #region Edge Cases and Complex Scenarios

    [Fact]
    public async Task CreateFile_ShouldHandleEmptyParties_Gracefully()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract",
            Parties = new PartiesDto() // Empty parties
        };

        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ReturnsAsync(documentId);

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _mockDocumentService.Verify(s => s.LinkPartyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CreatePartyDocumentLinkDto>()), Times.Never);
    }

    [Fact]
    public async Task CreateFile_ShouldHandlePartiesWithEmptyIds_Gracefully()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract",
            Parties = new PartiesDto
            {
                A = new List<PartyMemberDto> 
                { 
                    new() { Id = "", Name = "Empty ID Party" }, // Empty ID
                    new() { Id = "valid-id", Name = "Valid Party", NotaryDate = DateTime.UtcNow }
                }
            }
        };

        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ReturnsAsync(documentId);
        _mockDocumentService.Setup(s => s.LinkPartyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CreatePartyDocumentLinkDto>()))
            .Returns(Task.CompletedTask);

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // Should only link the party with valid ID
        _mockDocumentService.Verify(s => s.LinkPartyAsync(documentId, "valid-id", It.IsAny<CreatePartyDocumentLinkDto>()), Times.Once);
        _mockDocumentService.Verify(s => s.LinkPartyAsync(documentId, "", It.IsAny<CreatePartyDocumentLinkDto>()), Times.Never);
    }

    [Fact]
    public async Task CreateFile_ShouldSetDefaultNotaryDate_WhenNotProvided()
    {
        // Arrange
        var createFileDto = new CreateFileDto
        {
            CreatedDate = DateTime.UtcNow,
            Secretary = "John Secretary",
            NotaryPublic = "Jane Notary",
            TransactionCode = "TX12345",
            Description = "Test document",
            DocumentType = "Contract",
            Parties = new PartiesDto
            {
                A = new List<PartyMemberDto> 
                { 
                    new() { Id = "party-1", Name = "Party 1" } // No NotaryDate set (default DateTime)
                }
            }
        };

        var documentId = "doc-123";
        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ReturnsAsync(documentId);
        _mockDocumentService.Setup(s => s.LinkPartyAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CreatePartyDocumentLinkDto>()))
            .Returns(Task.CompletedTask);

        var json = JsonSerializer.Serialize(createFileDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _mockDocumentService.Verify(s => s.LinkPartyAsync(documentId, "party-1", 
            It.Is<CreatePartyDocumentLinkDto>(dto => dto.NotaryDate > DateTime.UtcNow.AddMinutes(-1))), Times.Once);
    }

    #endregion
}