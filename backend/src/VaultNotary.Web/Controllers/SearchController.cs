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

    [HttpGet("customers")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<CustomerDto>>> SearchCustomers([FromQuery] string identity)
    {
        if (string.IsNullOrEmpty(identity))
            return BadRequest("Identity parameter is required");

        var customers = await _searchService.SearchCustomersByIdentityAsync(identity);
        return Ok(customers);
    }



    [HttpGet("documents/identity/{documentId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByDocumentId(string documentId)
    {
        var documents = await _searchService.SearchDocumentsByTransactionCodeAsync(documentId);
        return Ok(documents);
    }

    [HttpGet("documents/business/{registrationNumber}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByBusinessRegistration(string registrationNumber)
    {
        var documents = await _searchService.SearchDocumentsByBusinessRegistrationAsync(registrationNumber);
        return Ok(documents);
    }

    [HttpGet("documents/passport/{passportId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> SearchByPassport(string passportId)
    {
        var documents = await _searchService.SearchDocumentsByPassportAsync(passportId);
        return Ok(documents);
    }

    [HttpPost("documents/cross-reference")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<DocumentDto>>> CrossReferenceSearch([FromBody] List<string> customerIds)
    {
        if (customerIds == null || !customerIds.Any())
            return BadRequest("Customer IDs are required");

        var documents = await _searchService.CrossReferenceSearchAsync(customerIds);
        return Ok(documents);
    }

    [HttpGet("party-links/document/{documentId}")]
    [HasPermission(Permissions.SearchDocuments)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetPartyDocumentLinks(string documentId)
    {
        var links = await _searchService.GetPartyDocumentLinksAsync(documentId);
        return Ok(links);
    }

    [HttpGet("party-links/customer/{customerId}")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<PartyDocumentLinkDto>>> GetCustomerDocumentLinks(string customerId)
    {
        var links = await _searchService.GetCustomerDocumentLinksAsync(customerId);
        return Ok(links);
    }
}