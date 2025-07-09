using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Controllers;
using VaultNotary.Infrastructure.Jobs;

namespace VaultNotary.IntegrationTests.Controllers;

public class UploadControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<IFileService> _mockFileService;
    private readonly Mock<IDocumentService> _mockDocumentService;
    private readonly Mock<IDocumentFileService> _mockDocumentFileService;
    private readonly Mock<IJobQueue> _mockJobQueue;

    public UploadControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockFileService = new Mock<IFileService>();
        _mockDocumentService = new Mock<IDocumentService>();
        _mockDocumentFileService = new Mock<IDocumentFileService>();
        _mockJobQueue = new Mock<IJobQueue>();
        
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var fileServiceDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IFileService));
                if (fileServiceDescriptor != null)
                {
                    services.Remove(fileServiceDescriptor);
                }
                services.AddScoped(_ => _mockFileService.Object);

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
    public async Task UploadSingle_ShouldReturnOk_WhenFileUploaded()
    {
        var fileContent = "Test file content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        var fileKey = "test-file-key";

        _mockFileService.Setup(s => s.UploadAsync(It.IsAny<FileUploadDto>()))
            .ReturnsAsync(fileKey);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
        content.Add(fileContent1, "file", "test.txt");

        var response = await _client.PostAsync("/api/upload/single", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetProperty("fileKey").GetString().Should().Be(fileKey);
    }

    [Fact]
    public async Task UploadSingle_ShouldReturnBadRequest_WhenNoFileProvided()
    {
        using var content = new MultipartFormDataContent();

        var response = await _client.PostAsync("/api/upload/single", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task InitiateMultipartUpload_ShouldReturnOk_WithUploadInfo()
    {
        var initiateDto = new MultipartUploadInitiateDto
        {
            FileName = "large-file.pdf",
            ContentType = "application/pdf",
            FileSize = 100000
        };

        var responseDto = new MultipartUploadInitiateResponseDto
        {
            UploadId = "upload-123",
            Key = "file-key-123"
        };

        _mockFileService.Setup(s => s.InitiateMultipartUploadAsync(It.IsAny<MultipartUploadInitiateDto>()))
            .ReturnsAsync(responseDto);

        var response = await _client.PostAsJsonAsync("/api/upload/initiate", initiateDto);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<MultipartUploadInitiateResponseDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.UploadId.Should().Be("upload-123");
        result.Key.Should().Be("file-key-123");
    }

    [Fact]
    public async Task UploadPart_ShouldReturnOk_WithETag()
    {
        var key = "file-key";
        var partNumber = 1;
        var uploadId = "upload-123";
        var fileContent = "Part content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        var partResponse = new MultipartUploadPartResponseDto
        {
            ETag = "etag-123",
            PartNumber = partNumber
        };

        _mockFileService.Setup(s => s.UploadPartAsync(It.IsAny<MultipartUploadPartDto>()))
            .ReturnsAsync(partResponse);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        content.Add(fileContent1, "file", "part.txt");

        var response = await _client.PutAsync($"/api/upload/{key}/part/{partNumber}?uploadId={uploadId}", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<MultipartUploadPartResponseDto>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.ETag.Should().Be("etag-123");
        result.PartNumber.Should().Be(partNumber);
    }

    [Fact]
    public async Task UploadFile_ShouldReturnBadRequest_WhenFileSizeExceeds50MB()
    {
        var documentId = "test-doc-id";
        
        // Create a large file content (simulate 51MB)
        var largeFileContent = new byte[51 * 1024 * 1024]; // 51MB
        for (int i = 0; i < largeFileContent.Length; i++)
        {
            largeFileContent[i] = 65; // ASCII 'A'
        }

        _mockDocumentService.Setup(s => s.ExistsAsync(documentId))
            .ReturnsAsync(true);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(largeFileContent);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        content.Add(fileContent1, "File", "large.pdf");
        content.Add(new StringContent(documentId), "DocumentId");

        var response = await _client.PostAsync("/api/upload", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AbortMultipartUpload_ShouldReturnNoContent()
    {
        var key = "file-key";
        var uploadId = "upload-123";

        var response = await _client.DeleteAsync($"/api/upload/{key}?uploadId={uploadId}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
        
        _mockFileService.Verify(s => s.AbortMultipartUploadAsync(key, uploadId), Times.Once);
    }

    [Fact]
    public async Task ComputeHash_ShouldReturnOk_WithHash()
    {
        var key = "file-key";
        var fileContent = "Test content for hashing";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        var expectedHash = "computed-hash-123";

        _mockFileService.Setup(s => s.ComputeHashAsync(It.IsAny<Stream>()))
            .ReturnsAsync(expectedHash);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        content.Add(fileContent1, "file", "test.txt");

        var response = await _client.PostAsync($"/api/upload/{key}/hash", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetProperty("hash").GetString().Should().Be(expectedHash);
    }

    [Fact]
    public async Task VerifyHash_ShouldReturnOk_WithValidationResult()
    {
        var key = "file-key";
        var hash = "test-hash";
        var fileContent = "Test content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        _mockFileService.Setup(s => s.VerifyHashAsync(hash, It.IsAny<Stream>()))
            .ReturnsAsync(true);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        content.Add(fileContent1, "file", "test.txt");

        var response = await _client.PostAsync($"/api/upload/{key}/verify?hash={hash}", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
        result.GetProperty("isValid").GetBoolean().Should().BeTrue();
    }

    [Fact]
    public async Task VerifyHash_ShouldReturnBadRequest_WhenHashMissing()
    {
        var key = "file-key";
        var fileContent = "Test content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        content.Add(fileContent1, "file", "test.txt");

        var response = await _client.PostAsync($"/api/upload/{key}/verify", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadSingle_ShouldPublishCompressFileJob_WhenPdfFileUploaded()
    {
        var fileContent = "Test PDF content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        var fileKey = "test-pdf-file-key";

        _mockFileService.Setup(s => s.UploadAsync(It.IsAny<FileUploadDto>()))
            .ReturnsAsync(fileKey);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");
        content.Add(fileContent1, "file", "test.pdf");

        var response = await _client.PostAsync("/api/upload/single", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        // Verify that CompressFileJob was published
        _mockJobQueue.Verify(q => q.PublishAsync(It.Is<CompressFileJob>(job => 
            job.FileKey == fileKey && 
            job.FileName == "test.pdf")), Times.Once);
    }

    [Fact]
    public async Task UploadSingle_ShouldNotPublishCompressFileJob_WhenNonPdfFileUploaded()
    {
        var fileContent = "Test text content";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        var fileKey = "test-text-file-key";

        _mockFileService.Setup(s => s.UploadAsync(It.IsAny<FileUploadDto>()))
            .ReturnsAsync(fileKey);

        using var content = new MultipartFormDataContent();
        using var fileContent1 = new ByteArrayContent(fileBytes);
        fileContent1.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
        content.Add(fileContent1, "file", "test.txt");

        var response = await _client.PostAsync("/api/upload/single", content);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        // Verify that CompressFileJob was NOT published for image files
        _mockJobQueue.Verify(q => q.PublishAsync(It.IsAny<CompressFileJob>()), Times.Never);
    }

    [Fact]
    public async Task DeleteFile_ShouldReturnNotFound_WhenFileNotExists()
    {
        var fileId = "nonexistent-file-id";

        _mockDocumentFileService.Setup(s => s.GetByIdAsync(fileId))
            .ReturnsAsync((DocumentFileDto?)null);

        var response = await _client.DeleteAsync($"/api/upload/{fileId}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }
}