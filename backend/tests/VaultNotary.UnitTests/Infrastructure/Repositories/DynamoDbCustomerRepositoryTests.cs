using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using VaultNotary.Domain.Entities;
using VaultNotary.Infrastructure.Repositories;

namespace VaultNotary.UnitTests.Infrastructure.Repositories;

public class DynamoDbCustomerRepositoryTests
{
    private readonly Mock<IAmazonDynamoDB> _mockDynamoDb;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly DynamoDbCustomerRepository _repository;
    private readonly string _tableName = "VaultNotary-Customers-Test";

    public DynamoDbCustomerRepositoryTests()
    {
        _mockDynamoDb = new Mock<IAmazonDynamoDB>();
        _mockConfiguration = new Mock<IConfiguration>();
        var mockSection = new Mock<IConfigurationSection>();
        mockSection.Setup(x => x.Value).Returns(_tableName);
        _mockConfiguration.Setup(x => x.GetSection("Aws:DynamoDb:CustomersTableName")).Returns(mockSection.Object);
        _repository = new DynamoDbCustomerRepository(_mockDynamoDb.Object, _mockConfiguration.Object);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var customerId = "123";
        var customer = CreateSampleCustomer(customerId);
        var item = MapCustomerToDynamoDb(customer);

        _mockDynamoDb.Setup(x => x.GetItemAsync(It.IsAny<GetItemRequest>(), default))
            .ReturnsAsync(new GetItemResponse { Item = item });

        // Act
        var result = await _repository.GetByIdAsync(customerId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(customerId);
        result.FullName.Should().Be(customer.FullName);
        
        _mockDynamoDb.Verify(x => x.GetItemAsync(
            It.Is<GetItemRequest>(req => 
                req.TableName == _tableName &&
                req.Key["PK"].S == customerId &&
                req.Key["SK"].S == customerId),
            default), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenCustomerDoesNotExist()
    {
        // Arrange
        var customerId = "999";

        _mockDynamoDb.Setup(x => x.GetItemAsync(It.IsAny<GetItemRequest>(), default))
            .ReturnsAsync(new GetItemResponse { Item = new Dictionary<string, AttributeValue>() });

        // Act
        var result = await _repository.GetByIdAsync(customerId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldHandleEmptyId()
    {
        // Arrange
        var customerId = "";

        // Act
        var result = await _repository.GetByIdAsync(customerId);

        // Assert
        result.Should().BeNull();
        _mockDynamoDb.Verify(x => x.GetItemAsync(It.IsAny<GetItemRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task GetByDocumentIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var documentId = "DOC123";
        var customer = CreateSampleCustomer("123", documentId: documentId);
        var items = new List<Dictionary<string, AttributeValue>> { MapCustomerToDynamoDb(customer) };

        _mockDynamoDb.Setup(x => x.QueryAsync(It.IsAny<QueryRequest>(), default))
            .ReturnsAsync(new QueryResponse { Items = items });

        // Act
        var result = await _repository.GetByDocumentIdAsync(documentId);

        // Assert
        result.Should().NotBeNull();
        result!.DocumentId.Should().Be(documentId);
        
        _mockDynamoDb.Verify(x => x.QueryAsync(
            It.Is<QueryRequest>(req => 
                req.TableName == _tableName &&
                req.IndexName == "GSI1" &&
                req.KeyConditionExpression == "GSI1PK = :documentId" &&
                req.ExpressionAttributeValues[":documentId"].S == documentId),
            default), Times.Once);
    }

    [Fact]
    public async Task GetByDocumentIdAsync_ShouldHandleEmptyDocumentId()
    {
        // Arrange
        var documentId = "";

        // Act
        var result = await _repository.GetByDocumentIdAsync(documentId);

        // Assert
        result.Should().BeNull();
        _mockDynamoDb.Verify(x => x.QueryAsync(It.IsAny<QueryRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task GetByPassportIdAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var passportId = "PASS123";
        var customer = CreateSampleCustomer("123", passportId: passportId);
        var items = new List<Dictionary<string, AttributeValue>> { MapCustomerToDynamoDb(customer) };

        _mockDynamoDb.Setup(x => x.QueryAsync(It.IsAny<QueryRequest>(), default))
            .ReturnsAsync(new QueryResponse { Items = items });

        // Act
        var result = await _repository.GetByPassportIdAsync(passportId);

        // Assert
        result.Should().NotBeNull();
        result!.PassportId.Should().Be(passportId);
        
        _mockDynamoDb.Verify(x => x.QueryAsync(
            It.Is<QueryRequest>(req => 
                req.TableName == _tableName &&
                req.IndexName == "GSI2" &&
                req.KeyConditionExpression == "GSI2PK = :passportId" &&
                req.ExpressionAttributeValues[":passportId"].S == passportId),
            default), Times.Once);
    }

    [Fact]
    public async Task GetByPassportIdAsync_ShouldHandleEmptyPassportId()
    {
        // Arrange
        var passportId = "";

        // Act
        var result = await _repository.GetByPassportIdAsync(passportId);

        // Assert
        result.Should().BeNull();
        _mockDynamoDb.Verify(x => x.QueryAsync(It.IsAny<QueryRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task GetByBusinessRegistrationAsync_ShouldReturnCustomer_WhenExists()
    {
        // Arrange
        var businessRegNumber = "BRN123";
        var customer = CreateSampleCustomer("123", businessRegistrationNumber: businessRegNumber);
        var items = new List<Dictionary<string, AttributeValue>> { MapCustomerToDynamoDb(customer) };

        _mockDynamoDb.Setup(x => x.QueryAsync(It.IsAny<QueryRequest>(), default))
            .ReturnsAsync(new QueryResponse { Items = items });

        // Act
        var result = await _repository.GetByBusinessRegistrationAsync(businessRegNumber);

        // Assert
        result.Should().NotBeNull();
        result!.BusinessRegistrationNumber.Should().Be(businessRegNumber);
        
        _mockDynamoDb.Verify(x => x.QueryAsync(
            It.Is<QueryRequest>(req => 
                req.TableName == _tableName &&
                req.IndexName == "GSI3" &&
                req.KeyConditionExpression == "GSI3PK = :businessRegNumber" &&
                req.ExpressionAttributeValues[":businessRegNumber"].S == businessRegNumber),
            default), Times.Once);
    }

    [Fact]
    public async Task GetByBusinessRegistrationAsync_ShouldHandleEmptyBusinessRegistrationNumber()
    {
        // Arrange
        var businessRegNumber = "";

        // Act
        var result = await _repository.GetByBusinessRegistrationAsync(businessRegNumber);

        // Assert
        result.Should().BeNull();
        _mockDynamoDb.Verify(x => x.QueryAsync(It.IsAny<QueryRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldSetCorrectKeys_AndReturnId()
    {
        // Arrange
        var customer = CreateSampleCustomer("123", "DOC123", "PASS123", "BRN123");

        _mockDynamoDb.Setup(x => x.PutItemAsync(It.IsAny<PutItemRequest>(), default))
            .ReturnsAsync(new PutItemResponse());

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().Be(customer.Id);
        
        _mockDynamoDb.Verify(x => x.PutItemAsync(
            It.Is<PutItemRequest>(req => 
                req.TableName == _tableName &&
                req.Item["PK"].S == customer.Id &&
                req.Item["SK"].S == customer.Id &&
                req.Item["GSI1PK"].S == customer.DocumentId &&
                req.Item["GSI2PK"].S == customer.PassportId &&
                req.Item["GSI3PK"].S == customer.BusinessRegistrationNumber),
            default), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldHandleNullOptionalFields()
    {
        // Arrange
        var customer = new Customer
        {
            Id = "123",
            FullName = "John Doe",
            Address = "123 Main St",
            Type = CustomerType.Individual,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Phone = null,
            Email = null,
            DocumentId = null,
            PassportId = null,
            BusinessRegistrationNumber = null,
            BusinessName = null
        };

        _mockDynamoDb.Setup(x => x.PutItemAsync(It.IsAny<PutItemRequest>(), default))
            .ReturnsAsync(new PutItemResponse());

        // Act
        var result = await _repository.CreateAsync(customer);

        // Assert
        result.Should().Be(customer.Id);
        
        _mockDynamoDb.Verify(x => x.PutItemAsync(
            It.Is<PutItemRequest>(req => 
                req.TableName == _tableName &&
                req.Item["PK"].S == customer.Id &&
                req.Item["SK"].S == customer.Id &&
                !req.Item.ContainsKey("GSI1PK") &&
                !req.Item.ContainsKey("GSI2PK") &&
                !req.Item.ContainsKey("GSI3PK") &&
                !req.Item.ContainsKey("Phone") &&
                !req.Item.ContainsKey("Email") &&
                !req.Item.ContainsKey("BusinessName")),
            default), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateAllIndexes_WhenIdentifiersChange()
    {
        // Arrange
        var customer = CreateSampleCustomer("123", "DOC123", "PASS123", "BRN123");

        _mockDynamoDb.Setup(x => x.PutItemAsync(It.IsAny<PutItemRequest>(), default))
            .ReturnsAsync(new PutItemResponse());

        // Act
        await _repository.UpdateAsync(customer);

        // Assert
        _mockDynamoDb.Verify(x => x.PutItemAsync(
            It.Is<PutItemRequest>(req => 
                req.TableName == _tableName &&
                req.Item["PK"].S == customer.Id &&
                req.Item["SK"].S == customer.Id &&
                req.Item["GSI1PK"].S == customer.DocumentId &&
                req.Item["GSI2PK"].S == customer.PassportId &&
                req.Item["GSI3PK"].S == customer.BusinessRegistrationNumber &&
                req.Item["UpdatedAt"].S != null),
            default), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldRemoveIndexes_WhenIdentifiersAreRemoved()
    {
        // Arrange
        var customer = CreateSampleCustomer("123", "DOC123", "PASS123", "BRN123");
        await _repository.CreateAsync(customer);

        // Remove identifiers
        customer.DocumentId = null;
        customer.PassportId = null;
        customer.BusinessRegistrationNumber = null;

        _mockDynamoDb.Setup(x => x.PutItemAsync(It.IsAny<PutItemRequest>(), default))
            .ReturnsAsync(new PutItemResponse());

        // Act
        await _repository.UpdateAsync(customer);

        // Assert
        _mockDynamoDb.Verify(x => x.PutItemAsync(
            It.Is<PutItemRequest>(req => 
                req.TableName == _tableName &&
                req.Item["PK"].S == customer.Id &&
                req.Item["SK"].S == customer.Id &&
                !req.Item.ContainsKey("GSI1PK") &&
                !req.Item.ContainsKey("GSI2PK") &&
                !req.Item.ContainsKey("GSI3PK") &&
                !req.Item.ContainsKey("DocumentId") &&
                !req.Item.ContainsKey("PassportId") &&
                !req.Item.ContainsKey("BusinessRegistrationNumber")),
            default), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldUseCompositeKey()
    {
        // Arrange
        var customerId = "123";

        _mockDynamoDb.Setup(x => x.DeleteItemAsync(It.IsAny<DeleteItemRequest>(), default))
            .ReturnsAsync(new DeleteItemResponse());

        // Act
        await _repository.DeleteAsync(customerId);

        // Assert
        _mockDynamoDb.Verify(x => x.DeleteItemAsync(
            It.Is<DeleteItemRequest>(req => 
                req.TableName == _tableName &&
                req.Key["PK"].S == customerId &&
                req.Key["SK"].S == customerId),
            default), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldHandleEmptyId()
    {
        // Arrange
        var customerId = "";

        // Act
        await _repository.DeleteAsync(customerId);

        // Assert
        _mockDynamoDb.Verify(x => x.DeleteItemAsync(It.IsAny<DeleteItemRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldReturnDistinctCustomers()
    {
        // Arrange
        var identity = "123456789";
        var customer = CreateSampleCustomer("123", identity, identity, identity);
        var items = new List<Dictionary<string, AttributeValue>> { MapCustomerToDynamoDb(customer) };

        _mockDynamoDb.Setup(x => x.QueryAsync(It.IsAny<QueryRequest>(), default))
            .ReturnsAsync(new QueryResponse { Items = items });

        // Act
        var result = await _repository.SearchByIdentityAsync(identity);

        // Assert
        result.Should().HaveCount(1); // Should be distinct
        result[0].Id.Should().Be(customer.Id);
    }

    [Fact]
    public async Task SearchByIdentityAsync_ShouldHandleEmptyIdentity()
    {
        // Arrange
        var identity = "";

        // Act
        var result = await _repository.SearchByIdentityAsync(identity);

        // Assert
        result.Should().BeEmpty();
        _mockDynamoDb.Verify(x => x.QueryAsync(It.IsAny<QueryRequest>(), default), Times.Never);
    }

    [Fact]
    public async Task GetAllAsync_ShouldHandleEmptyTable()
    {
        // Arrange
        _mockDynamoDb.Setup(x => x.ScanAsync(It.IsAny<ScanRequest>(), default))
            .ReturnsAsync(new ScanResponse { Items = new List<Dictionary<string, AttributeValue>>() });

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_ShouldHandleLargeDataSet()
    {
        // Arrange
        var items = new List<Dictionary<string, AttributeValue>>();
        for (int i = 0; i < 100; i++)
        {
            var customer = CreateSampleCustomer($"id{i}");
            items.Add(MapCustomerToDynamoDb(customer));
        }

        _mockDynamoDb.Setup(x => x.ScanAsync(It.IsAny<ScanRequest>(), default))
            .ReturnsAsync(new ScanResponse { Items = items });

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().HaveCount(100);
    }

    private static Customer CreateSampleCustomer(
        string id, 
        string? documentId = null, 
        string? passportId = null, 
        string? businessRegistrationNumber = null)
    {
        return new Customer
        {
            Id = id,
            FullName = "John Doe",
            Address = "123 Main St",
            Phone = "555-1234",
            Email = "john@example.com",
            Type = CustomerType.Individual,
            DocumentId = documentId,
            PassportId = passportId,
            BusinessRegistrationNumber = businessRegistrationNumber,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static Dictionary<string, AttributeValue> MapCustomerToDynamoDb(Customer customer)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            { "PK", new AttributeValue { S = customer.Id } },
            { "SK", new AttributeValue { S = customer.Id } },
            { "FullName", new AttributeValue { S = customer.FullName } },
            { "Address", new AttributeValue { S = customer.Address } },
            { "Type", new AttributeValue { S = customer.Type.ToString() } },
            { "CreatedAt", new AttributeValue { S = customer.CreatedAt.ToString("O") } },
            { "UpdatedAt", new AttributeValue { S = customer.UpdatedAt.ToString("O") } }
        };

        if (!string.IsNullOrEmpty(customer.Phone))
        {
            item["Phone"] = new AttributeValue { S = customer.Phone };
        }
        if (!string.IsNullOrEmpty(customer.Email))
        {
            item["Email"] = new AttributeValue { S = customer.Email };
        }
        if (!string.IsNullOrEmpty(customer.DocumentId))
        {
            item["DocumentId"] = new AttributeValue { S = customer.DocumentId };
            item["GSI1PK"] = new AttributeValue { S = customer.DocumentId };
        }
        if (!string.IsNullOrEmpty(customer.PassportId))
        {
            item["PassportId"] = new AttributeValue { S = customer.PassportId };
            item["GSI2PK"] = new AttributeValue { S = customer.PassportId };
        }
        if (!string.IsNullOrEmpty(customer.BusinessRegistrationNumber))
        {
            item["BusinessRegistrationNumber"] = new AttributeValue { S = customer.BusinessRegistrationNumber };
            item["GSI3PK"] = new AttributeValue { S = customer.BusinessRegistrationNumber };
        }

        return item;
    }
} 