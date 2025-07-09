using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.ComponentModel.DataAnnotations;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Controllers;
using VaultNotary.Domain.Entities;
using Xunit;

namespace VaultNotary.UnitTests.Controllers;

public class SearchControllerTests
{
    private readonly Mock<ISearchService> _mockSearchService;
    private readonly Mock<ILogger<SearchController>> _mockLogger;
    private readonly SearchController _controller;

    public SearchControllerTests()
    {
        _mockSearchService = new Mock<ISearchService>();
        _mockLogger = new Mock<ILogger<SearchController>>();
        _controller = new SearchController(_mockSearchService.Object, _mockLogger.Object);
    }

    #region Customer Search Tests

    [Fact]
    public async Task SearchCustomers_ShouldReturnOk_WithValidIdentity()
    {
        // Arrange
        var identity = "123456789";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>
            {
                new() { Id = "1", FullName = "John Doe", DocumentId = identity }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchCustomers(identity, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<CustomerDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
        returnValue.Items[0].FullName.Should().Be("John Doe");
        returnValue.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnBadRequest_WhenIdentityIsEmpty()
    {
        // Arrange
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await _controller.SearchCustomers("", request);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnBadRequest_WhenIdentityIsWhitespace()
    {
        // Arrange
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await _controller.SearchCustomers("   ", request);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task SearchCustomers_ShouldReturnInternalServerError_WhenServiceThrowsException()
    {
        // Arrange
        var identity = "123456789";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
        
        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, request.PageNumber, request.PageSize))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _controller.SearchCustomers(identity, request);

        // Assert
        var statusCodeResult = result.Result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
    }

    #endregion

    #region Transaction Code Search Tests

    [Fact]
    public async Task SearchByTransactionCode_ShouldReturnOk_WithValidCode()
    {
        // Arrange
        var transactionCode = "TXN123";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByTransactionCodePagedAsync(transactionCode, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByTransactionCode(transactionCode, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
        returnValue.Items[0].TransactionCode.Should().Be(transactionCode);
    }

    [Fact]
    public async Task SearchByTransactionCode_ShouldReturnBadRequest_WhenCodeIsEmpty()
    {
        // Arrange
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await _controller.SearchByTransactionCode("", request);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Business Registration Search Tests

    [Fact]
    public async Task SearchByBusinessRegistration_ShouldReturnOk_WithValidRegistration()
    {
        // Arrange
        var registrationNumber = "REG123456";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByBusinessRegistrationPagedAsync(registrationNumber, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByBusinessRegistration(registrationNumber, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
    }

    #endregion

    #region Passport Search Tests

    [Fact]
    public async Task SearchByPassport_ShouldReturnOk_WithValidPassportId()
    {
        // Arrange
        var passportId = "P123456789";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByPassportPagedAsync(passportId, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByPassport(passportId, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
    }

    #endregion

    #region Notary Search Tests

    [Fact]
    public async Task SearchByNotary_ShouldReturnOk_WithValidNotaryName()
    {
        // Arrange
        var notaryPublic = "John Notary";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByNotaryPagedAsync(notaryPublic, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByNotary(notaryPublic, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
        returnValue.Items[0].NotaryPublic.Should().Be(notaryPublic);
    }

    #endregion

    #region Customer Search Tests

    [Fact]
    public async Task SearchByCustomer_ShouldReturnOk_WithValidCustomerId()
    {
        // Arrange
        var customerId = "CUST123";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByCustomerPagedAsync(customerId, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByCustomer(customerId, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
    }

    #endregion

    #region Secretary Search Tests

    [Fact]
    public async Task SearchBySecretary_ShouldReturnOk_WithValidSecretaryName()
    {
        // Arrange
        var secretary = "Jane Secretary";
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };
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

        _mockSearchService.Setup(s => s.SearchDocumentsBySecretaryPagedAsync(secretary, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchBySecretary(secretary, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
        returnValue.Items[0].Secretary.Should().Be(secretary);
    }

    #endregion

    #region Date Range Search Tests

    [Fact]
    public async Task SearchByDateRange_ShouldReturnOk_WithValidDateRange()
    {
        // Arrange
        var request = new DateRangeSearchRequestDto
        {
            From = new DateTime(2023, 1, 1),
            To = new DateTime(2023, 12, 31),
            PageNumber = 1,
            PageSize = 10
        };
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

        _mockSearchService.Setup(s => s.SearchDocumentsByDateRangePagedAsync(request.From, request.To, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchByDateRange(request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<DocumentDto>>().Subject;
        returnValue.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task SearchByDateRange_ShouldReturnBadRequest_WhenFromDateIsAfterToDate()
    {
        // Arrange
        var request = new DateRangeSearchRequestDto
        {
            From = new DateTime(2023, 12, 31),
            To = new DateTime(2023, 1, 1),
            PageNumber = 1,
            PageSize = 10
        };

        // Act
        var result = await _controller.SearchByDateRange(request);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Cross Reference Search Tests

    [Fact]
    public async Task CrossReferenceSearch_ShouldReturnOk_WithValidCustomerIds()
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
        var result = await _controller.CrossReferenceSearch(customerIds);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<List<DocumentDto>>().Subject;
        returnValue.Should().HaveCount(1);
    }

    [Fact]
    public async Task CrossReferenceSearch_ShouldReturnBadRequest_WhenCustomerIdsIsEmpty()
    {
        // Arrange
        var customerIds = new List<string>();

        // Act
        var result = await _controller.CrossReferenceSearch(customerIds);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CrossReferenceSearch_ShouldReturnBadRequest_WhenTooManyCustomerIds()
    {
        // Arrange
        var customerIds = Enumerable.Range(1, 51).Select(i => $"CUST{i}").ToList();

        // Act
        var result = await _controller.CrossReferenceSearch(customerIds);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Party Document Links Tests

    [Fact]
    public async Task GetPartyDocumentLinks_ShouldReturnOk_WithValidDocumentId()
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
        var result = await _controller.GetPartyDocumentLinks(documentId);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<List<PartyDocumentLinkDto>>().Subject;
        returnValue.Should().HaveCount(1);
        returnValue[0].DocumentId.Should().Be(documentId);
    }

    [Fact]
    public async Task GetCustomerDocumentLinks_ShouldReturnOk_WithValidCustomerId()
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
        var result = await _controller.GetCustomerDocumentLinks(customerId);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<List<PartyDocumentLinkDto>>().Subject;
        returnValue.Should().HaveCount(1);
        returnValue[0].CustomerId.Should().Be(customerId);
    }

    #endregion

    #region Validation Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task SearchEndpoints_ShouldReturnBadRequest_WhenParameterIsNullOrEmpty(string invalidParameter)
    {
        // Arrange
        var request = new SearchRequestDto { PageNumber = 1, PageSize = 10 };

        // Act & Assert
        var transactionResult = await _controller.SearchByTransactionCode(invalidParameter, request);
        transactionResult.Result.Should().BeOfType<BadRequestObjectResult>();

        var notaryResult = await _controller.SearchByNotary(invalidParameter, request);
        notaryResult.Result.Should().BeOfType<BadRequestObjectResult>();

        var customerResult = await _controller.SearchByCustomer(invalidParameter, request);
        customerResult.Result.Should().BeOfType<BadRequestObjectResult>();

        var secretaryResult = await _controller.SearchBySecretary(invalidParameter, request);
        secretaryResult.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Pagination Tests

    [Fact]
    public async Task SearchEndpoints_ShouldReturnCorrectPaginationMetadata()
    {
        // Arrange
        var identity = "123456789";
        var request = new SearchRequestDto { PageNumber = 2, PageSize = 5 };
        var expectedResult = new PagedResultDto<CustomerDto>
        {
            Items = new List<CustomerDto>
            {
                new() { Id = "6", FullName = "Customer 6" },
                new() { Id = "7", FullName = "Customer 7" }
            },
            TotalCount = 12,
            PageNumber = 2,
            PageSize = 5
        };

        _mockSearchService.Setup(s => s.SearchCustomersByIdentityPagedAsync(identity, request.PageNumber, request.PageSize))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _controller.SearchCustomers(identity, request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnValue = okResult.Value.Should().BeOfType<PagedResultDto<CustomerDto>>().Subject;
        
        returnValue.PageNumber.Should().Be(2);
        returnValue.PageSize.Should().Be(5);
        returnValue.TotalCount.Should().Be(12);
        returnValue.TotalPages.Should().Be(3);
        returnValue.HasPreviousPage.Should().BeTrue();
        returnValue.HasNextPage.Should().BeTrue();
    }

    #endregion
}