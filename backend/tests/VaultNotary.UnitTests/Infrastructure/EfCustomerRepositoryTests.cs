using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using VaultNotary.Domain.Entities;
using VaultNotary.Infrastructure.Data;
using VaultNotary.Infrastructure.Repositories;

namespace VaultNotary.UnitTests.Infrastructure;

public class EfCustomerRepositoryTests : IDisposable
{
    private readonly VaultNotaryDbContext _context;
    private readonly EfCustomerRepository _repository;

    public EfCustomerRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<VaultNotaryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new VaultNotaryDbContext(options);
        _repository = new EfCustomerRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Create Tests

    [Fact]
    public async Task CreateAsync_ShouldCreateCustomer_WhenValidDataProvided()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Email = "john.doe@example.com",
            Phone = "+1234567890",
            Type = CustomerType.Individual,
            DocumentId = "DOC123456789"
        };

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().Be(customer.Id);
        var savedCustomer = await _context.Customers.FindAsync(customer.Id);
        savedCustomer.Should().NotBeNull();
        savedCustomer!.Email.Should().Be("john.doe@example.com");
        savedCustomer.FullName.Should().Be("John Doe");
    }

    [Fact]
    public async Task CreateAsync_ShouldGenerateId_WhenIdIsEmpty()
    {
        // Arrange
        var customer = new Customer
        {
            FullName = "Jane Doe",
            Address = "456 Oak St",
            Type = CustomerType.Individual
        };

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().NotBe(""); // Should have generated a GUID
        var savedCustomer = await _context.Customers.FindAsync(result);
        savedCustomer.Should().NotBeNull();
        savedCustomer!.FullName.Should().Be("Jane Doe");
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowException_WhenCustomerWithSameIdExists()
    {
        // Arrange
        var customer1 = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual
        };
        var customer2 = new Customer
        {
            Id = "cust-1", // Same ID
            FullName = "Jane Smith",
            Address = "456 Oak St",
            Type = CustomerType.Individual
        };

        await _repository.CreateAsync(customer1);

        // Act & Assert
        await FluentActions.Invoking(() => _repository.CreateAsync(customer2))
            .Should().ThrowAsync<Exception>();
    }

    [Fact]
    public async Task CreateAsync_ShouldHandleSpecialCharacters_InNames()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-special",
            FullName = "José María García-López",
            Address = "Calle José María, 123, 28001 Madrid, España",
            Email = "jose.garcia@españa.com",
            Phone = "+34-123-456-789",
            Type = CustomerType.Individual,
            DocumentId = "DNI-12345678-Z"
        };

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().Be(customer.Id);
        var savedCustomer = await _context.Customers.FindAsync(customer.Id);
        savedCustomer.Should().NotBeNull();
        savedCustomer!.FullName.Should().Be("José María García-López");
        savedCustomer.Email.Should().Be("jose.garcia@españa.com");
    }

    [Fact]
    public async Task CreateAsync_ShouldHandleBusinessCustomer()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-business",
            FullName = "Tech Solutions Inc.",
            Address = "Business District, Tower 1",
            Email = "contact@techsolutions.com",
            Type = CustomerType.Business,
            BusinessName = "Tech Solutions Inc.",
            BusinessRegistrationNumber = "BRN123456789"
        };

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().Be(customer.Id);
        var savedCustomer = await _context.Customers.FindAsync(customer.Id);
        savedCustomer.Should().NotBeNull();
        savedCustomer!.Type.Should().Be(CustomerType.Business);
        savedCustomer.BusinessName.Should().Be("Tech Solutions Inc.");
        savedCustomer.BusinessRegistrationNumber.Should().Be("BRN123456789");
    }

    #endregion

    #region Read Tests

    [Fact]
    public async Task GetByIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Email = "john@example.com",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.GetByIdAsync("cust-1");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be("cust-1");
        result.FullName.Should().Be("John Doe");
        result.Email.Should().Be("john@example.com");
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        // Act
        var result = await _repository.GetByIdAsync("non-existent");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByDocumentIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            DocumentId = "DOC123456789",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.GetByDocumentIdAsync("DOC123456789");

        // Assert
        result.Should().NotBeNull();
        result!.DocumentId.Should().Be("DOC123456789");
    }

    [Fact]
    public async Task GetByPassportIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            PassportId = "PP123456789",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.GetByPassportIdAsync("PP123456789");

        // Assert
        result.Should().NotBeNull();
        result!.PassportId.Should().Be("PP123456789");
    }

    [Fact]
    public async Task GetByBusinessRegistrationAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "Business Corp",
            Address = "123 Business St",
            BusinessRegistrationNumber = "BRN123456789",
            Type = CustomerType.Business
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.GetByBusinessRegistrationAsync("BRN123456789");

        // Assert
        result.Should().NotBeNull();
        result!.BusinessRegistrationNumber.Should().Be("BRN123456789");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllCustomers_OrderedByName()
    {
        // Arrange
        var customers = new[]
        {
            new Customer { Id = "cust-1", FullName = "Charlie Brown", Address = "Address 1", Type = CustomerType.Individual },
            new Customer { Id = "cust-2", FullName = "Alice Smith", Address = "Address 2", Type = CustomerType.Individual },
            new Customer { Id = "cust-3", FullName = "Bob Johnson", Address = "Address 3", Type = CustomerType.Individual }
        };

        foreach (var customer in customers)
        {
            await _repository.CreateAsync(customer);
        }

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result[0].FullName.Should().Be("Alice Smith");
        result[1].FullName.Should().Be("Bob Johnson");
        result[2].FullName.Should().Be("Charlie Brown");
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldReturnMatchingCustomers()
    {
        // Arrange
        var customers = new[]
        {
            new Customer { Id = "cust-1", FullName = "John Doe", Address = "Addr1", DocumentId = "DOC123", Type = CustomerType.Individual },
            new Customer { Id = "cust-2", FullName = "Jane Smith", Address = "Addr2", PassportId = "DOC123", Type = CustomerType.Individual },
            new Customer { Id = "cust-3", FullName = "Bob Corp", Address = "Addr3", BusinessRegistrationNumber = "DOC123", Type = CustomerType.Business },
            new Customer { Id = "cust-4", FullName = "Other Customer", Address = "Addr4", DocumentId = "OTHER456", Type = CustomerType.Individual }
        };

        foreach (var customer in customers)
        {
            await _repository.CreateAsync(customer);
        }

        // Act
        var result = await _repository.SearchByIdentityAsync("DOC123");

        // Assert
        result.Should().HaveCount(3); // Should match all three customers with "DOC123"
        result.Select(c => c.Id).Should().Contain(new[] { "cust-1", "cust-2", "cust-3" });
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task UpdateAsync_ShouldUpdateCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Email = "john@example.com",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        customer.FullName = "Johnny Doe";
        customer.Email = "johnny@example.com";
        customer.Phone = "+9876543210";

        // Act
        await _repository.UpdateAsync(customer);

        // Assert
        var updatedCustomer = await _context.Customers.FindAsync("cust-1");
        updatedCustomer.Should().NotBeNull();
        updatedCustomer!.FullName.Should().Be("Johnny Doe");
        updatedCustomer.Email.Should().Be("johnny@example.com");
        updatedCustomer.Phone.Should().Be("+9876543210");
        updatedCustomer.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowException_WhenCustomerNotExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "non-existent",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual
        };

        // Act & Assert
        await FluentActions.Invoking(() => _repository.UpdateAsync(customer))
            .Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task DeleteAsync_ShouldDeleteCustomer_WhenExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        await _repository.DeleteAsync("cust-1");

        // Assert
        var deletedCustomer = await _context.Customers.FindAsync("cust-1");
        deletedCustomer.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldNotThrow_WhenCustomerNotExists()
    {
        // Act & Assert
        await FluentActions.Invoking(() => _repository.DeleteAsync("non-existent"))
            .Should().NotThrowAsync();
    }

    #endregion

    #region Exists Tests

    [Fact]
    public async Task ExistsAsync_ShouldReturnTrue_WhenCustomerExists()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.ExistsAsync("cust-1");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_ShouldReturnFalse_WhenCustomerNotExists()
    {
        // Act
        var result = await _repository.ExistsAsync("non-existent");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Edge Cases and Performance Tests

    [Fact]
    public async Task Repository_ShouldHandleLargeDatasets()
    {
        // Arrange
        var customers = Enumerable.Range(1, 1000)
            .Select(i => new Customer
            {
                Id = $"cust-{i}",
                FullName = $"Customer {i:D4}",
                Address = $"Address {i}",
                Email = $"user{i}@example.com",
                Type = i % 2 == 0 ? CustomerType.Business : CustomerType.Individual
            }).ToArray();

        // Act
        foreach (var customer in customers)
        {
            await _repository.CreateAsync(customer);
        }

        // Assert
        var allCustomers = await _repository.GetAllAsync();
        allCustomers.Should().HaveCount(1000);
    }

    [Fact]
    public async Task Repository_ShouldHandleConcurrentOperations()
    {
        // Arrange
        var tasks = Enumerable.Range(1, 10)
            .Select(async i =>
            {
                var customer = new Customer
                {
                    Id = $"cust-{i}",
                    FullName = $"User {i}",
                    Address = "Test Address",
                    Email = $"user{i}@test.com",
                    Type = CustomerType.Individual
                };
                return await _repository.CreateAsync(customer);
            });

        // Act
        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().HaveCount(10);
        results.Should().OnlyContain(id => !string.IsNullOrEmpty(id));
        
        var allCustomers = await _repository.GetAllAsync();
        allCustomers.Should().HaveCount(10);
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldHandleNullAndEmptyQueries()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            DocumentId = "DOC123",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result1 = await _repository.SearchByIdentityAsync("");
        var result2 = await _repository.SearchByIdentityAsync(null!);

        // Assert
        result1.Should().BeEmpty();
        result2.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldHandleSpecialCharacters()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "José García",
            Address = "Test Address",
            DocumentId = "DOC-123@456",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.SearchByIdentityAsync("DOC-123@456");

        // Assert
        result.Should().HaveCount(1);
        result[0].DocumentId.Should().Be("DOC-123@456");
    }

    [Fact]
    public async Task Repository_ShouldMaintainDataIntegrity_DuringComplexOperations()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Email = "john@example.com",
            Type = CustomerType.Individual
        };

        // Act - Create, Update, Check, Update again
        await _repository.CreateAsync(customer);
        
        customer.FullName = "Johnny Doe";
        await _repository.UpdateAsync(customer);
        
        var exists = await _repository.ExistsAsync("cust-1");
        var retrieved = await _repository.GetByIdAsync("cust-1");
        
        customer.Address = "456 Oak St";
        await _repository.UpdateAsync(customer);
        
        var final = await _repository.GetByIdAsync("cust-1");

        // Assert
        exists.Should().BeTrue();
        retrieved.Should().NotBeNull();
        retrieved!.FullName.Should().Be("Johnny Doe");
        final.Should().NotBeNull();
        final!.FullName.Should().Be("Johnny Doe");
        final.Address.Should().Be("456 Oak St");
    }

    [Fact]
    public async Task GetAllAsync_ShouldIncludeRelatedData()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "cust-1",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual
        };
        await _repository.CreateAsync(customer);

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(1);
        var customerWithRelations = result[0];
        customerWithRelations.PartyDocumentLinks.Should().NotBeNull(); // Should be loaded but empty
    }

    [Fact]
    public async Task Repository_ShouldHandleDifferentCustomerTypes()
    {
        // Arrange
        var individuals = new[]
        {
            new Customer { Id = "ind-1", FullName = "John Doe", Address = "Addr1", Type = CustomerType.Individual, DocumentId = "DOC1" },
            new Customer { Id = "ind-2", FullName = "Jane Smith", Address = "Addr2", Type = CustomerType.Individual, PassportId = "PP1" }
        };

        var businesses = new[]
        {
            new Customer { Id = "biz-1", FullName = "Corp Inc", Address = "Addr3", Type = CustomerType.Business, BusinessRegistrationNumber = "BRN1", BusinessName = "Corp Inc" },
            new Customer { Id = "biz-2", FullName = "LLC Company", Address = "Addr4", Type = CustomerType.Business, BusinessRegistrationNumber = "BRN2", BusinessName = "LLC Company" }
        };

        // Act
        foreach (var customer in individuals.Concat(businesses))
        {
            await _repository.CreateAsync(customer);
        }

        // Assert
        var allCustomers = await _repository.GetAllAsync();
        allCustomers.Should().HaveCount(4);
        allCustomers.Count(c => c.Type == CustomerType.Individual).Should().Be(2);
        allCustomers.Count(c => c.Type == CustomerType.Business).Should().Be(2);
        
        var businessCustomers = allCustomers.Where(c => c.Type == CustomerType.Business).ToList();
        businessCustomers.Should().AllSatisfy(c => c.BusinessName.Should().NotBeNullOrEmpty());
    }

    #endregion
}