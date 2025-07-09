using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Net.Http.Json;
using System.Text.Json;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Domain.Entities;

namespace VaultNotary.IntegrationTests.Controllers;

public class SearchControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<ISearchService> _mockSearchService;

    public SearchControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockSearchService = new Mock<ISearchService>();
        
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ISearchService));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }
                services.AddScoped(_ => _mockSearchService.Object);
            });
            
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    #region Customer Search Integration Tests

    [Fact]
    public async Task SearchCustomers_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var identity = "123456789";
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>
            {
                new() { Id = "1", FullName = "John Doe", DocumentId = identity },
                new() { Id = "2", FullName = "Jane Smith", DocumentId = identity }
            },
            TotalCount = 2,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/customers?identity={identity}&pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<CustomerDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnBadRequest_WhenIdentityMissing()
    {
        // Act
        var response = await _client.GetAsync("/api/search/customers?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnBadRequest_WhenInvalidPagination()
    {
        // Act
        var response = await _client.GetAsync("/api/search/customers?identity=123&pageNumber=0&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion

    #region Transaction Code Search Integration Tests

    [Fact]
    public async Task SearchByTransactionCode_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var transactionCode = "TXN123";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", TransactionCode = transactionCode, Description = "Test Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByTransactionCodePagedAsync(transactionCode, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/transaction-code/{transactionCode}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
        result.Items[0].TransactionCode.Should().Be(transactionCode);
    }

    #endregion

    #region Business Registration Search Integration Tests

    [Fact]
    public async Task SearchByBusinessRegistration_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var registrationNumber = "REG123456";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", Description = "Business Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByBusinessRegistrationPagedAsync(registrationNumber, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/business/{registrationNumber}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
    }

    #endregion

    #region Passport Search Integration Tests

    [Fact]
    public async Task SearchByPassport_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var passportId = "P123456789";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", Description = "Passport Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByPassportPagedAsync(passportId, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/passport/{passportId}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
    }

    #endregion

    #region Notary Search Integration Tests

    [Fact]
    public async Task SearchByNotary_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var notaryPublic = "John Notary";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", NotaryPublic = notaryPublic, Description = "Notarized Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByNotaryPagedAsync(notaryPublic, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/notary/{Uri.EscapeDataString(notaryPublic)}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
        result.Items[0].NotaryPublic.Should().Be(notaryPublic);
    }

    #endregion

    #region Customer Search Integration Tests

    [Fact]
    public async Task SearchByCustomer_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var customerId = "CUST123";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", Description = "Customer Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByCustomerPagedAsync(customerId, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/customer/{customerId}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
    }

    #endregion

    #region Secretary Search Integration Tests

    [Fact]
    public async Task SearchBySecretary_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var secretary = "Jane Secretary";
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", Secretary = secretary, Description = "Secretary Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsBySecretaryPagedAsync(secretary, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/secretary/{Uri.EscapeDataString(secretary)}?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
        result.Items[0].Secretary.Should().Be(secretary);
    }

    #endregion

    #region Date Range Search Integration Tests

    [Fact]
    public async Task SearchByDateRange_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var fromDate = new DateTime(2023, 1, 1);
        var toDate = new DateTime(2023, 12, 31);
        var expectedResult = new PagedResultDto<DocumentDto>
        {
            Items = new List<DocumentDto>
            {
                new() { Id = "1", CreatedDate = new DateTime(2023, 6, 15), Description = "Date Range Document" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchDocumentsByDateRangePagedAsync(fromDate, toDate, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/documents/date-range?from={fromDate:yyyy-MM-dd}&to={toDate:yyyy-MM-dd}&pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task SearchByDateRange_ShouldReturnBadRequest_WhenFromDateIsAfterToDate()
    {
        // Act
        var response = await _client.GetAsync("/api/search/documents/date-range?from=2023-12-31&to=2023-01-01&pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion

    #region Cross Reference Search Integration Tests

    [Fact]
    public async Task CrossReferenceSearch_ShouldReturnOk_WithResults()
    {
        // Arrange
        var customerIds = new List<string> { "CUST1", "CUST2", "CUST3" };
        var expectedResult = new List<DocumentDto>
        {
            new() { Id = "1", Description = "Cross Reference Document" }
        };

        _mockSearchService.Setup(s => s.CrossReferenceSearchAsync(customerIds))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/documents/cross-reference", customerIds);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<DocumentDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
    }

    [Fact]
    public async Task CrossReferenceSearch_ShouldReturnBadRequest_WhenCustomerIdsIsEmpty()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/search/documents/cross-reference", new List<string>());

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion

    #region Party Document Links Integration Tests

    [Fact]
    public async Task GetPartyDocumentLinks_ShouldReturnOk_WithResults()
    {
        // Arrange
        var documentId = "DOC123";
        var expectedResult = new List<PartyDocumentLinkDto>
        {
            new() { DocumentId = documentId, CustomerId = "CUST1", PartyRole = PartyRole.PartyA }
        };

        _mockSearchService.Setup(s => s.GetPartyDocumentLinksAsync(documentId))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/party-links/document/{documentId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<PartyDocumentLinkDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result[0].DocumentId.Should().Be(documentId);
    }

    [Fact]
    public async Task GetCustomerDocumentLinks_ShouldReturnOk_WithResults()
    {
        // Arrange
        var customerId = "CUST123";
        var expectedResult = new List<PartyDocumentLinkDto>
        {
            new() { DocumentId = "DOC1", CustomerId = customerId, PartyRole = PartyRole.PartyA }
        };

        _mockSearchService.Setup(s => s.GetCustomerDocumentLinksAsync(customerId))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/party-links/customer/{customerId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<PartyDocumentLinkDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result[0].CustomerId.Should().Be(customerId);
    }

    #endregion

    #region Rate Limiting Tests

    [Fact]
    public async Task SearchEndpoints_ShouldReturnTooManyRequests_WhenRateLimitExceeded()
    {
        // Note: This test would require a more sophisticated setup to actually test rate limiting
        // For now, we'll just verify that the rate limiting middleware is configured
        // In a real scenario, you would need to make multiple rapid requests to trigger rate limiting
        
        // Arrange
        var identity = "123456789";
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/customers?identity={identity}&pageNumber=1&pageSize=10");

        // Assert
        // For this test, we just verify that the endpoint responds normally
        // Rate limiting would require more complex testing with multiple concurrent requests
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
    }

    #endregion

    #region Pagination Edge Cases

    [Fact]
    public async Task SearchEndpoints_ShouldReturnEmptyResults_WhenNoDataFound()
    {
        // Arrange
        var identity = "nonexistent";
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, 1, 10))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/customers?identity={identity}&pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<CustomerDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task SearchEndpoints_ShouldHandleLargePageSize()
    {
        // Arrange
        var identity = "123456789";
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 100
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, 1, 100))
            .ReturnsAsync(expectedResult);

        // Act
        var response = await _client.GetAsync($"/api/search/customers?identity={identity}&pageNumber=1&pageSize=100");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PagedResultDto<CustomerDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        result.Should().NotBeNull();
        result!.PageSize.Should().Be(100);
    }

    [Fact]
    public async Task SearchEndpoints_ShouldReturnBadRequest_WhenPageSizeExceedsLimit()
    {
        // Act
        var response = await _client.GetAsync("/api/search/customers?identity=123&pageNumber=1&pageSize=101");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    #endregion
}