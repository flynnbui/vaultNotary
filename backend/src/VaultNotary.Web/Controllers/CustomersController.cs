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

    [HttpGet("paginated")]
    [HasPermission(Permissions.ReadCustomers)]
    public async Task<ActionResult<PaginatedResult<CustomerDto>>> GetAllPaginated(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await _customerService.GetAllCustomersAsync(pageNumber, pageSize);
        return Ok(result);
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

    [HttpPost]
    [HasPermission(Permissions.CreateCustomers)]
    public async Task<ActionResult<string>> Create([FromBody] CreateCustomerDto createCustomerDto)
    {
        var duplicates = await _customerService.DetectDuplicatesAsync(createCustomerDto);
        if (duplicates.Any())
            return BadRequest($"Đã tìm thấy khách hàng trùng lặp với thông tin định danh giống nhau.");

        if (!ModelState.IsValid)
        {
            var errorMessages = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
            var fullErrorMessage = "Dữ liệu gửi lên không hợp lệ: " + string.Join("; ", errorMessages);
            return BadRequest(fullErrorMessage);
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
        if (!ModelState.IsValid)
        {
            var errorMessages = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
            var fullErrorMessage = "Dữ liệu gửi lên không hợp lệ: " + string.Join("; ", errorMessages);
            return BadRequest(fullErrorMessage);
        }
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
}