using FluentAssertions;
using VaultNotary.Domain.Entities;

namespace VaultNotary.UnitTests.Domain.Entities;

public class CustomerTests
{
    [Fact]
    public void Customer_ShouldInitialize_WithDefaultValues()
    {
        var customer = new Customer();

        customer.Id.Should().BeEmpty();
        customer.FullName.Should().BeEmpty();
        customer.Address.Should().BeEmpty();
        customer.Phone.Should().BeNull();
        customer.Email.Should().BeNull();
        customer.Type.Should().Be(CustomerType.Individual);
        customer.DocumentId.Should().BeNull();
        customer.PassportId.Should().BeNull();
        customer.BusinessRegistrationNumber.Should().BeNull();
        customer.PartyDocumentLinks.Should().BeEmpty();
    }

    [Fact]
    public void Customer_ShouldSetProperties_Correctly()
    {
        var customer = new Customer
        {
            Id = "123",
            FullName = "John Doe",
            Address = "123 Main St",
            Phone = "555-1234",
            Email = "john@example.com",
            Type = CustomerType.Individual,
            DocumentId = "123456789",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        customer.Id.Should().Be("123");
        customer.FullName.Should().Be("John Doe");
        customer.Address.Should().Be("123 Main St");
        customer.Phone.Should().Be("555-1234");
        customer.Email.Should().Be("john@example.com");
        customer.Type.Should().Be(CustomerType.Individual);
        customer.DocumentId.Should().Be("123456789");
    }

    [Fact]
    public void CustomerType_ShouldHave_CorrectValues()
    {
        CustomerType.Individual.Should().Be(CustomerType.Individual);
        CustomerType.Business.Should().Be(CustomerType.Business);
    }
}