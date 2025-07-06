using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VaultNotary.Application.DTOs;
using VaultNotary.Application.Services;
using VaultNotary.Web.Authorization;

namespace VaultNotary.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    [HasPermission(Permissions.ReadCustomers)]
    public async Task<ActionResult<List<CustomerDto>>> GetAll()
    {
        var customers = await _customerService.GetAllAsync();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.ReadCustomers)]
    public async Task<ActionResult<CustomerDto>> GetById(string id)
    {
        var customer = await _customerService.GetByIdAsync(id);
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpGet("search")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<CustomerDto>>> SearchByIdentity([FromQuery] string identity)
    {
        if (string.IsNullOrEmpty(identity))
            return BadRequest("Identity parameter is required");

        var customers = await _customerService.SearchByIdentityAsync(identity);
        return Ok(customers);
    }

    [HttpGet("documents/{identity}")]
    [HasPermission(Permissions.SearchCustomers)]
    public async Task<ActionResult<List<CustomerDto>>> GetDocumentsByIdentity(string identity)
    {
        var customers = await _customerService.SearchByIdentityAsync(identity);
        return Ok(customers);
    }

    [HttpPost]
    [HasPermission(Permissions.CreateCustomers)]
    public async Task<ActionResult<string>> Create([FromBody] CreateCustomerDto createCustomerDto)
    {
        var duplicates = await _customerService.DetectDuplicatesAsync(createCustomerDto);
        if (duplicates.Any())
        {
            return BadRequest($"Duplicate customer found with same identity information");
        }

        var customerId = await _customerService.CreateAsync(createCustomerDto);
        return CreatedAtAction(nameof(GetById), new { id = customerId }, customerId);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.UpdateCustomers)]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateCustomerDto updateCustomerDto)
    {
        if (!await _customerService.ExistsAsync(id))
            return NotFound();

        await _customerService.UpdateAsync(id, updateCustomerDto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.DeleteCustomers)]
    public async Task<ActionResult> Delete(string id)
    {
        if (!await _customerService.ExistsAsync(id))
            return NotFound();

        await _customerService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("validate")]
    public async Task<ActionResult<bool>> ValidateIdentity([FromBody] string identity)
    {
        var isValid = await _customerService.ValidateIdentityAsync(identity);
        return Ok(isValid);
    }
}