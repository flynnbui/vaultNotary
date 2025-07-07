using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Configuration;
using VaultNotary.Domain.Entities;
using VaultNotary.Domain.Repositories;
using VaultNotary.Infrastructure.Configuration;

namespace VaultNotary.Infrastructure.Repositories;

public class DynamoDbCustomerRepository : ICustomerRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public DynamoDbCustomerRepository(IAmazonDynamoDB dynamoDb, IConfiguration configuration)
    {
        _dynamoDb = dynamoDb;
        _tableName = configuration.GetSection("Aws:DynamoDb:CustomersTableName").Value ?? "VaultNotary-Customers";
    }

    public async Task<Customer?> GetByIdAsync(string id)
    {
        var request = new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                { "PK", new AttributeValue { S = id } },
                { "SK", new AttributeValue { S = id } }
            }
        };

        var response = await _dynamoDb.GetItemAsync(request);
        return response.Item.Count == 0 ? null : MapFromDynamoDb(response.Item);
    }

    public async Task<Customer?> GetByDocumentIdAsync(string documentId)
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            IndexName = "GSI1",
            KeyConditionExpression = "GSI1PK = :documentId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":documentId", new AttributeValue { S = documentId } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Count == 0 ? null : MapFromDynamoDb(response.Items[0]);
    }

    public async Task<Customer?> GetByPassportIdAsync(string passportId)
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            IndexName = "GSI2",
            KeyConditionExpression = "GSI2PK = :passportId",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":passportId", new AttributeValue { S = passportId } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Count == 0 ? null : MapFromDynamoDb(response.Items[0]);
    }

    public async Task<Customer?> GetByBusinessRegistrationAsync(string businessRegistrationNumber)
    {
        var request = new QueryRequest
        {
            TableName = _tableName,
            IndexName = "GSI3",
            KeyConditionExpression = "GSI3PK = :businessRegNumber",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                { ":businessRegNumber", new AttributeValue { S = businessRegistrationNumber } }
            }
        };

        var response = await _dynamoDb.QueryAsync(request);
        return response.Items.Count == 0 ? null : MapFromDynamoDb(response.Items[0]);
    }

    public async Task<List<Customer>> SearchByIdentityAsync(string identity)
    {
        var customers = new List<Customer>();

        var documentCustomer = await GetByDocumentIdAsync(identity);
        if (documentCustomer != null) customers.Add(documentCustomer);

        var passportCustomer = await GetByPassportIdAsync(identity);
        if (passportCustomer != null) customers.Add(passportCustomer);

        var businessCustomer = await GetByBusinessRegistrationAsync(identity);
        if (businessCustomer != null) customers.Add(businessCustomer);

        return customers.Distinct().ToList();
    }

    public async Task<List<Customer>> GetAllAsync()
    {
        var request = new ScanRequest
        {
            TableName = _tableName
        };

        var response = await _dynamoDb.ScanAsync(request);
        return response.Items.Select(MapFromDynamoDb).ToList();
    }

    public async Task<string> CreateAsync(Customer customer)
    {
        var item = MapToDynamoDb(customer);
        var request = new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        };

        await _dynamoDb.PutItemAsync(request);
        return customer.Id;
    }

    public async Task UpdateAsync(Customer customer)
    {
        var item = MapToDynamoDb(customer);
        var request = new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        };

        await _dynamoDb.PutItemAsync(request);
    }

    public async Task DeleteAsync(string id)
    {
        var request = new DeleteItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                { "PK", new AttributeValue { S = id } },
                { "SK", new AttributeValue { S = id } }
            }
        };

        await _dynamoDb.DeleteItemAsync(request);
    }

    public async Task<bool> ExistsAsync(string id)
    {
        var customer = await GetByIdAsync(id);
        return customer != null;
    }

    private static Customer MapFromDynamoDb(Dictionary<string, AttributeValue> item)
    {
        return new Customer
        {
            Id = item["PK"].S,
            FullName = item["FullName"].S,
            Address = item["Address"].S,
            Phone = item["Phone"].S,
            Email = item["Email"].S,
            Type = Enum.Parse<CustomerType>(item["Type"].S),
            DocumentId = item.ContainsKey("DocumentId") ? item["DocumentId"].S : null,
            PassportId = item.ContainsKey("PassportId") ? item["PassportId"].S : null,
            BusinessRegistrationNumber = item.ContainsKey("BusinessRegistrationNumber") ? item["BusinessRegistrationNumber"].S : null,
            BusinessName = item.ContainsKey("BusinessName") ? item["BusinessName"].S : null,
            CreatedAt = DateTime.Parse(item["CreatedAt"].S),
            UpdatedAt = DateTime.Parse(item["UpdatedAt"].S)
        };
    }

    private static Dictionary<string, AttributeValue> MapToDynamoDb(Customer customer)
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
         if (!string.IsNullOrEmpty(customer.BusinessName))
        {
            item["BussinessName"] = new AttributeValue { S = customer.BusinessName };
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