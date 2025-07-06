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
        var customers = new List<CustomerDto>
        {
            new() { Id = "1", FullName = "John Doe", Email = "john@example.com" },
            new() { Id = "2", FullName = "Jane Smith", Email = "jane@example.com" }
        };

        _mockCustomerService.Setup(s => s.GetAllAsync())
            .ReturnsAsync(customers);

        var response = await _client.GetAsync("/api/customers");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<CustomerDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.Should().HaveCount(2);
        result[0].FullName.Should().Be("John Doe");
        result[1].FullName.Should().Be("Jane Smith");
    }

    [Fact]
    public async Task GetCustomerById_ShouldReturnOk_WhenCustomerExists()
    {
        var customerId = "123";
        var customer = new CustomerDto
        {
            Id = customerId,
            FullName = "John Doe",
            Email = "john@example.com"
        };

        _mockCustomerService.Setup(s => s.GetByIdAsync(customerId))
            .ReturnsAsync(customer);

        var response = await _client.GetAsync($"/api/customers/{customerId}");

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
        var customerId = "999";

        _mockCustomerService.Setup(s => s.GetByIdAsync(customerId))
            .ReturnsAsync((CustomerDto?)null);

        var response = await _client.GetAsync($"/api/customers/{customerId}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCustomer_ShouldReturnCreated_WhenValidData()
    {
        var createDto = new CreateCustomerDto
        {
            FullName = "New Customer",
            Email = "new@example.com",
            Type = CustomerType.Individual,
            DocumentId = "123456789"
        };

        var newCustomerId = "new-customer-id";

        _mockCustomerService.Setup(s => s.DetectDuplicatesAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(new List<CustomerDto>());

        _mockCustomerService.Setup(s => s.CreateAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(newCustomerId);

        var response = await _client.PostAsJsonAsync("/api/customers", createDto);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateCustomer_ShouldReturnBadRequest_WhenDuplicateFound()
    {
        var createDto = new CreateCustomerDto
        {
            FullName = "Duplicate Customer",
            DocumentId = "123456789"
        };

        var duplicates = new List<CustomerDto>
        {
            new() { Id = "existing", FullName = "Existing Customer", DocumentId = "123456789" }
        };

        _mockCustomerService.Setup(s => s.DetectDuplicatesAsync(It.IsAny<CreateCustomerDto>()))
            .ReturnsAsync(duplicates);

        var response = await _client.PostAsJsonAsync("/api/customers", createDto);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnOk_WithResults()
    {
        var identity = "123456789";
        var customers = new List<CustomerDto>
        {
            new() { Id = "1", FullName = "Found Customer", DocumentId = identity }
        };

        _mockCustomerService.Setup(s => s.SearchByIdentityAsync(identity))
            .ReturnsAsync(customers);

        var response = await _client.GetAsync($"/api/customers/search?identity={identity}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<List<CustomerDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        result.Should().NotBeNull();
        result!.Should().HaveCount(1);
        result[0].FullName.Should().Be("Found Customer");
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnBadRequest_WhenIdentityMissing()
    {
        var response = await _client.GetAsync("/api/customers/search");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateCustomer_ShouldReturnNoContent_WhenSuccessful()
    {
        var customerId = "123";
        var updateDto = new UpdateCustomerDto
        {
            FullName = "Updated Name",
            Email = "updated@example.com"
        };

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId))
            .ReturnsAsync(true);

        var response = await _client.PutAsJsonAsync($"/api/customers/{customerId}", updateDto);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
        
        _mockCustomerService.Verify(s => s.UpdateAsync(customerId, It.IsAny<UpdateCustomerDto>()), Times.Once);
    }

    [Fact]
    public async Task UpdateCustomer_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        var customerId = "999";
        var updateDto = new UpdateCustomerDto();

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId))
            .ReturnsAsync(false);

        var response = await _client.PutAsJsonAsync($"/api/customers/{customerId}", updateDto);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteCustomer_ShouldReturnNoContent_WhenSuccessful()
    {
        var customerId = "123";

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId))
            .ReturnsAsync(true);

        var response = await _client.DeleteAsync($"/api/customers/{customerId}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);
        
        _mockCustomerService.Verify(s => s.DeleteAsync(customerId), Times.Once);
    }

    [Fact]
    public async Task DeleteCustomer_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        var customerId = "999";

        _mockCustomerService.Setup(s => s.ExistsAsync(customerId))
            .ReturnsAsync(false);

        var response = await _client.DeleteAsync($"/api/customers/{customerId}");

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }
}