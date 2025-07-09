using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.ComponentModel.DataAnnotations;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("SearchPolicy")]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;
    private readonly ILogger<SearchController> _logger;

    public SearchController(ISearchService searchService, ILogger<SearchController> logger)
    {
        _searchService = searchService;
        _logger = logger;
    }

    [HttpGet("customers")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<PagedResultDto<CustomerDto>>> SearchCustomers([FromQuery][Required][StringLength(100)] string identity, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(identity))
                return BadRequest("Identity parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customers = await _searchService.SearchCustomersByIdentityPagedAsync(identity, request.PageNumber, request.PageSize);
            return Ok(customers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching customers with identity: {Identity}", identity);
            return StatusCode(500, "An error occurred while searching customers");
        }
    }

    [HttpGet("documents/transaction-code/{transactionCode}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByTransactionCode([Required][StringLength(100)] string transactionCode, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(transactionCode))
                return BadRequest("Transaction code parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsByTransactionCodePagedAsync(transactionCode, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with transaction code: {TransactionCode}", transactionCode);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/business/{registrationNumber}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByBusinessRegistration([Required][StringLength(100)] string registrationNumber, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(registrationNumber))
                return BadRequest("Registration number parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsByBusinessRegistrationPagedAsync(registrationNumber, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with registration number: {RegistrationNumber}", registrationNumber);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/passport/{passportId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByPassport([Required][StringLength(50)] string passportId, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(passportId))
                return BadRequest("Passport ID parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsByPassportPagedAsync(passportId, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with passport ID: {PassportId}", passportId);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/notary/{notaryPublic}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByNotary([Required][StringLength(100)] string notaryPublic, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(notaryPublic))
                return BadRequest("Notary public parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsByNotaryPagedAsync(notaryPublic, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with notary public: {NotaryPublic}", notaryPublic);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/customer/{customerId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByCustomer([Required][StringLength(100)] string customerId, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customerId))
                return BadRequest("Customer ID parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsByCustomerPagedAsync(customerId, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with customer ID: {CustomerId}", customerId);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/secretary/{secretary}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchBySecretary([Required][StringLength(100)] string secretary, [FromQuery] SearchRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(secretary))
                return BadRequest("Secretary parameter is required and cannot be empty");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var documents = await _searchService.SearchDocumentsBySecretaryPagedAsync(secretary, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with secretary: {Secretary}", secretary);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpGet("documents/date-range")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<PagedResultDto<DocumentDto>>> SearchByDateRange([FromQuery] DateRangeSearchRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.From > request.To)
                return BadRequest("From date must be earlier than or equal to To date");

            var documents = await _searchService.SearchDocumentsByDateRangePagedAsync(request.From, request.To, request.PageNumber, request.PageSize);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching documents with date range: {From} to {To}", request.From, request.To);
            return StatusCode(500, "An error occurred while searching documents");
        }
    }

    [HttpPost("documents/cross-reference")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> CrossReferenceSearch([FromBody][Required] List<string> customerIds)
    {
        try
        {
            if (customerIds == null || !customerIds.Any())
                return BadRequest("Customer IDs are required");

            if (customerIds.Count > 50)
                return BadRequest("Maximum 50 customer IDs allowed");

            var documents = await _searchService.CrossReferenceSearchAsync(customerIds);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in cross-reference search with customer IDs: {CustomerIds}", string.Join(",", customerIds ?? new List<string>()));
            return StatusCode(500, "An error occurred while performing cross-reference search");
        }
    }

    [HttpGet("party-links/document/{documentId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetPartyDocumentLinks([Required][StringLength(100)] string documentId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(documentId))
                return BadRequest("Document ID parameter is required and cannot be empty");

            var links = await _searchService.GetPartyDocumentLinksAsync(documentId);
            return Ok(links);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting party document links for document ID: {DocumentId}", documentId);
            return StatusCode(500, "An error occurred while getting party document links");
        }
    }

    [HttpGet("party-links/customer/{customerId}")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetCustomerDocumentLinks([Required][StringLength(100)] string customerId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customerId))
                return BadRequest("Customer ID parameter is required and cannot be empty");

            var links = await _searchService.GetCustomerDocumentLinksAsync(customerId);
            return Ok(links);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer document links for customer ID: {CustomerId}", customerId);
            return StatusCode(500, "An error occurred while getting customer document links");
        }
    }
}