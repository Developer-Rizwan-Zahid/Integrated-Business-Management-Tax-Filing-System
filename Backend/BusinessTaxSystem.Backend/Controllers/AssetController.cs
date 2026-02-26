using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.DTOs;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssetController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> _hubContext;

        public AssetController(AppDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }

        private bool IsStaff() => User.IsInRole("Staff");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssetResponseDto>>> GetAssets()
        {
            var currentYear = DateTime.Now.Year;
            var query = _context.Assets.AsQueryable();

            if (IsStaff())
            {
                var userId = GetCurrentUserId();
                query = query.Where(a => a.CreatedByUserId == userId);
            }

            return await query
                .Include(a => a.Category)
                .Select(a => new AssetResponseDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    CategoryName = a.Category != null ? a.Category.Name : "Uncategorized",
                    PurchasePrice = a.PurchasePrice,
                    SalvageValue = a.SalvageValue,
                    UsefulLifeYears = a.UsefulLifeYears,
                    PurchaseDate = a.PurchaseDate,
                    Status = a.Status,
                    DepreciationMethod = a.DepreciationMethod,
                    CurrentDepreciation = a.CalculateDepreciation(currentYear)
                })
                .ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant,Staff")]
        public async Task<ActionResult<Asset>> CreateAsset(AssetCreateDto assetDto)
        {
            var asset = new Asset
            {
                Name = assetDto.Name,
                CategoryId = assetDto.CategoryId,
                PurchasePrice = assetDto.PurchasePrice,
                SalvageValue = assetDto.SalvageValue,
                UsefulLifeYears = assetDto.UsefulLifeYears,
                PurchaseDate = assetDto.PurchaseDate.Kind == DateTimeKind.Utc ? assetDto.PurchaseDate : assetDto.PurchaseDate.ToUniversalTime(),
                DepreciationMethod = assetDto.DepreciationMethod,
                Status = "Pending", // Starts as Pending for Admin Approval
                CreatedByUserId = GetCurrentUserId()
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("AssetChanged", new { action = "Created", asset });

            return CreatedAtAction(nameof(GetAssets), new { id = asset.Id }, asset);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<AssetCategory>>> GetCategories()
        {
            return await _context.AssetCategories.ToListAsync();
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<AssetCategory>> CreateCategory(AssetCategory category)
        {
            _context.AssetCategories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateCategory(int id, AssetCategory category)
        {
            if (id != category.Id) return BadRequest();
            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.AssetCategories.FindAsync(id);
            if (category == null) return NotFound();
            _context.AssetCategories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("depreciation/{id}")]
        public async Task<ActionResult<decimal>> GetDepreciation(int id, int? year)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null) return NotFound();

            var targetYear = year ?? DateTime.Now.Year;
            return Ok(asset.CalculateDepreciation(targetYear));
        }

        [HttpPost("assign")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<AssetAssignmentResponseDto>> AssignAsset(AssetAssignmentDto assignmentDto)
        {
            var asset = await _context.Assets.FindAsync(assignmentDto.AssetId);
            if (asset == null) return NotFound("Asset not found");

            var department = await _context.Departments.FindAsync(assignmentDto.DepartmentId);
            if (department == null) return NotFound("Department not found");

            var assignment = new AssetAssignment
            {
                AssetId = assignmentDto.AssetId,
                DepartmentId = assignmentDto.DepartmentId,
                EmployeeName = assignmentDto.EmployeeName,
                AssignedDate = DateTime.UtcNow
            };

            _context.AssetAssignments.Add(assignment);
            
            // Update asset status
            asset.Status = "Assigned";
            
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("AssetChanged", new { action = "Assigned", assetName = asset.Name, departmentName = department.Name });

            return Ok(new AssetAssignmentResponseDto
            {
                Id = assignment.Id,
                AssetName = asset.Name,
                DepartmentName = department.Name,
                EmployeeName = assignment.EmployeeName,
                AssignedDate = assignment.AssignedDate
            });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var asset = await _context.Assets.FindAsync(id);
            if (asset == null) return NotFound();

            // Status can be: Pending, Approved, Rejected, In Use, Disposed
            asset.Status = status;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("AssetChanged", new { action = "StatusUpdated", assetId = id, status });

            return NoContent();
        }
    }
}
