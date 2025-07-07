using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Text;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Infrastructure.Jobs;

namespace VaultNotary.IntegrationTests.Controllers;

public class DocumentsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<IDocumentService> _mockDocumentService;
    private readonly Mock<IJobQueue> _mockJobQueue;

    public DocumentsControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockDocumentService = new Mock<IDocumentService>();
        _mockJobQueue = new Mock<IJobQueue>();
        
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

                var jobQueueDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IJobQueue));
                if (jobQueueDescriptor != null)
                {
                    services.Remove(jobQueueDescriptor);
                }
                services.AddScoped(_ => _mockJobQueue.Object);
            });
            
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task UploadDocuments_ShouldPublishCompressFileJob_WhenPdfFileUploaded()
    {
        var fileId = "test-document-id";
        var fileContent = "Test PDF content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        var existingDocument = new DocumentDto
        {
            Id = fileId,
            FileName = "existing.pdf",
            NotaryPublic = "Test Notary",
            DocumentType = VaultNotary.Domain.Entities.DocumentType.Contract,
            NotaryDate = DateTime.UtcNow
        };

        _mockDocumentService.Setup(s => s.ExistsAsync(fileId))
            .ReturnsAsync(true);
        
        _mockDocumentService.Setup(s => s.GetByIdAsync(fileId))
            .ReturnsAsync(existingDocument);
        
        _mockDocumentService.Setup(s => s.UpdateAsync(fileId, It.IsAny<UpdateDocumentDto>()))
            .Returns(Task.CompletedTask);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        content.Add(fileContent1, "file", "test.pdf");
        content.Add(new StringContent(fileId), "fileId");

        var response = await _client.PostAsync("/api/documents/upload", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        // Verify that CompressFileJob was published
        _mockJobQueue.Verify(q => q.PublishAsync(It.Is<CompressFileJob>(job => 
            job.FileKey == $"documents/{fileId}/test.pdf" && 
            job.DocumentId == fileId &&
            job.FileName == "test.pdf")), Times.Once);
    }

    [Fact]
    public async Task UploadDocuments_ShouldNotPublishCompressFileJob_WhenNonPdfFileUploaded()
    {
        var fileId = "test-document-id";
        var fileContent = "Test text content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        var existingDocument = new DocumentDto
        {
            Id = fileId,
            FileName = "existing.txt",
            NotaryPublic = "Test Notary",
            DocumentType = VaultNotary.Domain.Entities.DocumentType.Contract,
            NotaryDate = DateTime.UtcNow
        };

        _mockDocumentService.Setup(s => s.ExistsAsync(fileId))
            .ReturnsAsync(true);
        
        _mockDocumentService.Setup(s => s.GetByIdAsync(fileId))
            .ReturnsAsync(existingDocument);
        
        _mockDocumentService.Setup(s => s.UpdateAsync(fileId, It.IsAny<UpdateDocumentDto>()))
            .Returns(Task.CompletedTask);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
        content.Add(fileContent1, "file", "test.txt");
        content.Add(new StringContent(fileId), "fileId");

        var response = await _client.PostAsync("/api/documents/upload", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        // Verify that CompressFileJob was NOT published for non-PDF files
        _mockJobQueue.Verify(q => q.PublishAsync(It.IsAny<CompressFileJob>()), Times.Never);
    }

    [Fact]
    public async Task UploadDocuments_ShouldReturnNotFound_WhenDocumentDoesNotExist()
    {
        var fileId = "non-existent-document-id";
        var fileContent = "Test PDF content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        _mockDocumentService.Setup(s => s.ExistsAsync(fileId))
            .ReturnsAsync(false);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        content.Add(fileContent1, "file", "test.pdf");
        content.Add(new StringContent(fileId), "fileId");

        var response = await _client.PostAsync("/api/documents/upload", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
        
        // Verify that CompressFileJob was NOT published
        _mockJobQueue.Verify(q => q.PublishAsync(It.IsAny<CompressFileJob>()), Times.Never);
    }
}