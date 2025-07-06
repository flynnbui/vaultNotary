using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("identity/{documentId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByDocumentId(string documentId)
    {
        var documents = await _searchService.SearchDocumentsByDocumentIdAsync(documentId);
        return Ok(documents);
    }

    [HttpGet("business/{registrationNumber}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByBusinessRegistration(string registrationNumber)
    {
        var documents = await _searchService.SearchDocumentsByBusinessRegistrationAsync(registrationNumber);
        return Ok(documents);
    }

    [HttpGet("passport/{passportId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByPassport(string passportId)
    {
        var documents = await _searchService.SearchDocumentsByPassportAsync(passportId);
        return Ok(documents);
    }

    [HttpGet("documents")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchDocumentsByParty([FromQuery] string partyId)
    {
        if (string.IsNullOrEmpty(partyId))
            return BadRequest("PartyId parameter is required");

        var documents = await _searchService.SearchDocumentsByCustomerAsync(partyId);
        return Ok(documents);
    }

    [HttpPost("cross-reference")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> CrossReferenceSearch([FromBody] List<string> customerIds)
    {
        if (customerIds == null || !customerIds.Any())
            return BadRequest("Customer IDs are required");

        var documents = await _searchService.CrossReferenceSearchAsync(customerIds);
        return Ok(documents);
    }

    [HttpGet("customers")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<CustomerDto>>> SearchCustomers([FromQuery] string identity)
    {
        if (string.IsNullOrEmpty(identity))
            return BadRequest("Identity parameter is required");

        var customers = await _searchService.SearchCustomersByIdentityAsync(identity);
        return Ok(customers);
    }

    [HttpGet("documents/text")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchDocuments([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query))
            return BadRequest("Query parameter is required");

        var documents = await _searchService.SearchDocumentsAsync(query);
        return Ok(documents);
    }

    [HttpGet("party-links/{documentId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetPartyDocumentLinks(string documentId)
    {
        var links = await _searchService.GetPartyDocumentLinksAsync(documentId);
        return Ok(links);
    }

    [HttpGet("customer-links/{customerId}")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetCustomerDocumentLinks(string customerId)
    {
        var links = await _searchService.GetCustomerDocumentLinksAsync(customerId);
        return Ok(links);
    }
}