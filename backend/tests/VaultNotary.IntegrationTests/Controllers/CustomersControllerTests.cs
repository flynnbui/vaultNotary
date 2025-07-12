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

public class CustomersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly Mock<ICustomerService> _mockCustomerService;

    public CustomersControllerTests(WebApplicationFactory<Program> factory)
    {
        _mockCustomerService = new Mock<ICustomerService>();
        
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>  
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ICustomerService));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }
                services.AddScoped(_ => _mockCustomerService.Object);
            });
            
            builder.UseEnvironment("Testing");
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCustomers_ShouldReturnOk_WithCustomerList()
    {
        // Arrange
        var customers = new List<CustomerDto>
        {
            new() { Id = "1", FullName = "John Doe", Email = "john@example.com" },
            new() { Id = "2", FullName = "Jane Smith", Email = "jane@example.com" }
        };

        _mockCustomerService.Setup(s => s.GetAllAsync()).ReturnsAsync(customers);

        // Act
        var response = await _client.GetAsync("/api/customers");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<CustomerDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCustomerById_ShouldReturnOk_WhenCustomerExists()
    {
        // Arrange
        var customerId = "123";
        var customer = new CustomerDto 
        { 
            Id = customerId, 
            FullName = "John Doe", 
            Email = "john@example.com" 
        };

        _mockCustomerService.Setup(s => s.GetByIdAsync(customerId)).ReturnsAsync(customer);

        // Act
        var response = await _client.GetAsync($"/api/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<CustomerDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.Id.Should().Be(customerId);
        result.FullName.Should().Be("John Doe");
    }

    [Fact]
    public async Task GetCustomerById_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        var customerId = "999";
        _mockCustomerService.Setup(s => s.GetByIdAsync(customerId)).ReturnsAsync((CustomerDto?)null);

        // Act
        var response = await _client.GetAsync($"/api/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCustomer_ShouldReturnCreated_WhenValidData()
    {
        // Arrange
        var createDto = new CreateCustomerDto
        {
            FullName = "John Doe",
            Email = "john@example.com",
            Phone = "1234567890",
            Address = "123 Main St",
            Gender = Gender.Male,
            Type = CustomerType.Individual
        };

        var customerId = "new-customer-id";
        _mockCustomerService.Setup(s => s.DetectDuplicatesAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(new List<CustomerDto>());
        _mockCustomerService.Setup(s => s.CreateAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(customerId);

        // Act
        var response = await _client.PostAsJsonAsync("/api/customers", createDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateCustomer_ShouldReturnBadRequest_WhenDuplicateFound()
    {
        // Arrange
        var createDto = new CreateCustomerDto
        {
            FullName = "John Doe",
            Email = "john@example.com",
            Phone = "1234567890",
            Address = "123 Main St",
            Gender = Gender.Male,
            Type = CustomerType.Individual
        };

        var duplicateCustomer = new CustomerDto
        {
            Id = "existing-id",
            FullName = "John Doe",
            Email = "john@example.com"
        };

        _mockCustomerService.Setup(s => s.DetectDuplicatesAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(new List<CustomerDto> { duplicateCustomer });

        // Act
        var response = await _client.PostAsJsonAsync("/api/customers", createDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateCustomer_ShouldReturnNoContent_WhenSuccessful()
    {
        // Arrange
        var customerId = "123";
        var updateDto = new UpdateCustomerDto
        {
            Id = customerId,
            FullName = "Updated Name",
            Email = "updated@example.com",
            Address = "456 Updated St",
            Gender = Gender.Male,
            Type = CustomerType.Individual
        };

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId)).ReturnsAsync(true);
        _mockCustomerService.Setup(s => s.UpdateAsync(customerId, It.IsAny<UpdateCustomerDto>()))
            .Returns(Task.CompletedTask);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/customers/{customerId}", updateDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task UpdateCustomer_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        var customerId = "999";
        var updateDto = new UpdateCustomerDto
        {
            Id = customerId,
            FullName = "Updated Name",
            Email = "updated@example.com",
            Address = "456 Updated St",
            Gender = Gender.Male,
            Type = CustomerType.Individual
        };

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId)).ReturnsAsync(false);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/customers/{customerId}", updateDto);

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteCustomer_ShouldReturnNoContent_WhenSuccessful()
    {
        // Arrange
        var customerId = "123";
        _mockCustomerService.Setup(s => s.DeleteAsync(customerId)).Returns(Task.CompletedTask);

        // Act
        var response = await _client.DeleteAsync($"/api/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteCustomer_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        var customerId = "999";
        _mockCustomerService.Setup(s => s.DeleteAsync(customerId))
            .ThrowsAsync(new KeyNotFoundException("Customer not found"));

        // Act
        var response = await _client.DeleteAsync($"/api/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAllPaginated_ShouldReturnOk_WithPaginatedResults()
    {
        // Arrange
        var paginatedResult = new PaginatedResult<CustomerDto>
        {
            Items = new List<CustomerDto>
            {
                new() { Id = "1", FullName = "John Doe", Email = "john@example.com" }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10,
        };

        _mockCustomerService.Setup(s => s.GetAllCustomersAsync(1, 10))
            .ReturnsAsync(paginatedResult);

        // Act
        var response = await _client.GetAsync("/api/customers/paginated?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PaginatedResult<CustomerDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.TotalCount.Should().Be(1);
        result.Items.Should().HaveCount(1);
    }
}