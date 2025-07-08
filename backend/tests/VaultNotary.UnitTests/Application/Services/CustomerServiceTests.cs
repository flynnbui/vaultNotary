using FluentAssertions;
using Moq;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;

namespace VaultNotary.UnitTests.Application.Services;

public class CustomerServiceTests
{
    private readonly Mock<ICustomerRepository> _mockCustomerRepository;
    private readonly CustomerService _customerService;

    public CustomerServiceTests()
    {
        _mockCustomerRepository = new Mock<ICustomerRepository>();
        _customerService = new CustomerService(_mockCustomerRepository.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnCustomerDto_WhenCustomerExists()
    {
        var customerId = "123";
        var customer = new Customer
        {
            Id = customerId,
            FullName = "John Doe",
            Email = "john@example.com",
            Type = CustomerType.Individual
        };

        _mockCustomerRepository.Setup(r => r.GetByIdAsync(customerId))
            .ReturnsAsync(customer);

        var result = await _customerService.GetByIdAsync(customerId);

        result.Should().NotBeNull();
        result!.Id.Should().Be(customerId);
        result.FullName.Should().Be("John Doe");
        result.Email.Should().Be("john@example.com");
        result.Type.Should().Be(CustomerType.Individual);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenCustomerDoesNotExist()
    {
        var customerId = "999";

        _mockCustomerRepository.Setup(r => r.GetByIdAsync(customerId))
            .ReturnsAsync((Customer?)null);

        var result = await _customerService.GetByIdAsync(customerId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ShouldReturnCustomerId_WhenCustomerIsCreated()
    {
        var createDto = new CreateCustomerDto
        {
            FullName = "Jane Doe",
            Email = "jane@example.com",
            Type = CustomerType.Individual,
            DocumentId = "123456789"
        };

        _mockCustomerRepository.Setup(r => r.CreateAsync(It.IsAny<Customer>()))
            .ReturnsAsync("new-customer-id");

        var result = await _customerService.CreateAsync(createDto);

        result.Should().Be("new-customer-id");
        _mockCustomerRepository.Verify(r => r.CreateAsync(It.Is<Customer>(c => 
            c.FullName == "Jane Doe" && 
            c.Email == "jane@example.com" && 
            c.Type == CustomerType.Individual &&
            c.DocumentId == "123456789")), Times.Once);
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldReturnCustomers_WhenMatchesFound()
    {
        var identity = "123456789";
        var customers = new List<Customer>
        {
            new Customer { Id = "1", FullName = "John Doe", DocumentId = identity },
            new Customer { Id = "2", FullName = "Jane Smith", PassportId = identity }
        };

        _mockCustomerRepository.Setup(r => r.SearchByIdentityAsync(identity))
            .ReturnsAsync(customers);

        var result = await _customerService.SearchByIdentityAsync(identity);

        result.Should().HaveCount(2);
        result[0].FullName.Should().Be("John Doe");
        result[1].FullName.Should().Be("Jane Smith");
    }


    [Fact]
    public async Task DetectDuplicatesAsync_ShouldReturnDuplicates_WhenFound()
    {
        var createDto = new CreateCustomerDto
        {
            DocumentId = "123456789",
            PassportId = "AB123456"
        };

        var duplicateCustomer = new Customer
        {
            Id = "existing-id",
            DocumentId = "123456789",
            FullName = "Existing Customer"
        };

        _mockCustomerRepository.Setup(r => r.GetByDocumentIdAsync("123456789"))
            .ReturnsAsync(duplicateCustomer);
        _mockCustomerRepository.Setup(r => r.GetByPassportIdAsync("AB123456"))
            .ReturnsAsync((Customer?)null);

        var result = await _customerService.DetectDuplicatesAsync(createDto);

        result.Should().HaveCount(1);
        result[0].Id.Should().Be("existing-id");
        result[0].FullName.Should().Be("Existing Customer");
    }

    [Fact]
    public async Task UpdateAsync_ShouldCallRepository_WhenCustomerExists()
    {
        var customerId = "123";
        var updateDto = new UpdateCustomerDto
        {
            FullName = "Updated Name",
            Email = "updated@example.com"
        };
        var existingCustomer = new Customer { Id = customerId, FullName = "Old Name" };

        _mockCustomerRepository.Setup(r => r.GetByIdAsync(customerId))
            .ReturnsAsync(existingCustomer);

        await _customerService.UpdateAsync(customerId, updateDto);

        _mockCustomerRepository.Verify(r => r.UpdateAsync(It.Is<Customer>(c =>
            c.Id == customerId &&
            c.FullName == "Updated Name" &&
            c.Email == "updated@example.com")), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowException_WhenCustomerDoesNotExist()
    {
        var customerId = "999";
        var updateDto = new UpdateCustomerDto();

        _mockCustomerRepository.Setup(r => r.GetByIdAsync(customerId))
            .ReturnsAsync((Customer?)null);

        var act = async () => await _customerService.UpdateAsync(customerId, updateDto);

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Customer not found");
    }
}