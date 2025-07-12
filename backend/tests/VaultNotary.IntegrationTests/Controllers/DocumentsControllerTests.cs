using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Text;
using System.Text.Json;
using System.Net.Http.Json;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Infrastructure.Jobs;

namespace VaultNotary.IntegrationTests.Controllers;

public class DocumentsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<IDocumentService> _mockDocumentService;

    public DocumentsControllerTests(WebApplicationFactory<Program> factory)
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

    [Fact]
    public async Task GetAll_ShouldReturnOk_WithDocumentList()
    {
        // Arrange
        var documents = new List<DocumentListDto>
        {
            new DocumentListDto
            {
                Id = "doc1",
                TransactionCode = "TX001",
                Secretary = "Secretary 1",
                NotaryPublic = "Notary 1",
                CreatedDate = DateTime.UtcNow
            },
            new DocumentListDto
            {
                Id = "doc2",
                TransactionCode = "TX002",
                Secretary = "Secretary 2",
                NotaryPublic = "Notary 2",
                CreatedDate = DateTime.UtcNow
            }
        };

        _mockDocumentService.Setup(s => s.GetAllAsync())
            .ReturnsAsync(documents);

        // Act
        var response = await _client.GetAsync("/api/documents");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetArrayLength().Should().Be(2);
    }

    [Fact]
    public async Task GetById_ShouldReturnOk_WhenDocumentExists()
    {
        // Arrange
        var documentId = "test-doc-id";
        var document = new DocumentDto
        {
            Id = documentId,
            TransactionCode = "TX001",
            Secretary = "Test Secretary",
            NotaryPublic = "Test Notary",
            CreatedDate = DateTime.UtcNow,
            Description = "Test document",
            DocumentType = VaultNotary.Domain.Entities.DocumentType.HopDong,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockDocumentService.Setup(s => s.GetByIdAsync(documentId))
            .ReturnsAsync(document);

        // Act
        var response = await _client.GetAsync($"/api/documents/{documentId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetProperty("id").GetString().Should().Be(documentId);
        result.GetProperty("transactionCode").GetString().Should().Be("TX001");
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        // Arrange
        var documentId = "non-existent-doc-id";

        _mockDocumentService.Setup(s => s.GetByIdAsync(documentId))
            .ReturnsAsync((DocumentDto?)null);

        // Act
        var response = await _client.GetAsync($"/api/documents/{documentId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_ShouldReturnCreated_WhenValidDocument()
    {
        // Arrange
        var createDto = new CreateDocumentDto
        {
            TransactionCode = "TX001",
            Secretary = "Test Secretary",
            NotaryPublic = "Test Notary",
            Description = "Test document",
            DocumentType = "Contract",
            CreatedDate = DateTime.UtcNow
        };

        var documentId = "new-doc-id";
        _mockDocumentService.Setup(s => s.CreateAsync(It.IsAny<CreateDocumentDto>()))
            .ReturnsAsync(documentId);

        // Act
        var response = await _client.PostAsJsonAsync("/api/documents", createDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain(documentId);
    }

    [Fact]
    public async Task Update_ShouldReturnNoContent_WhenValidDocument()
    {
        // Arrange
        var documentId = "test-doc-id";
        var updateDto = new UpdateDocumentDto
        {
            TransactionCode = "TX001-Updated",
            Secretary = "Updated Secretary",
            NotaryPublic = "Updated Notary",
            Description = "Updated description",
            DocumentType = "Updated Contract"
        };

        _mockDocumentService.Setup(s => s.UpdateAsync(documentId, It.IsAny<UpdateDocumentDto>()))
            .Returns(Task.CompletedTask);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/documents/{documentId}", updateDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Delete_ShouldReturnNoContent_WhenDocumentExists()
    {
        // Arrange
        var documentId = "test-doc-id";

        _mockDocumentService.Setup(s => s.DeleteAsync(documentId))
            .Returns(Task.CompletedTask);

        // Act
        var response = await _client.DeleteAsync($"/api/documents/{documentId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task GetAllPaginated_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var paginatedResult = new PaginatedResult<DocumentListDto>
        {
            Items = new List<DocumentListDto>
            {
                new DocumentListDto
                {
                    Id = "doc1",
                    TransactionCode = "TX001",
                    Secretary = "Secretary 1",
                    NotaryPublic = "Notary 1",
                    CreatedDate = DateTime.UtcNow
                }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10,
        };

        _mockDocumentService.Setup(s => s.GetAllDocumentsAsync(1, 10))
            .ReturnsAsync(paginatedResult);

        // Act
        var response = await _client.GetAsync("/api/documents/paginated?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetProperty("totalCount").GetInt32().Should().Be(1);
        result.GetProperty("pageNumber").GetInt32().Should().Be(1);
    }
}