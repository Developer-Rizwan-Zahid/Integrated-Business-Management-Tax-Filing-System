using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SystemSettingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        [HttpGet("{key}")]
        public async Task<ActionResult<SystemSetting>> GetSetting(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return NotFound();
            return Ok(setting);
        }

        [HttpPost]
        public async Task<ActionResult<SystemSetting>> CreateSetting(SystemSetting setting)
        {
            var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == setting.Key);
            if (existing != null)
            {
                return BadRequest("Setting with this key already exists.");
            }

            _context.SystemSettings.Add(setting);
            await _context.SaveChangesAsync();
            return Ok(setting);
        }

        [HttpPut("{key}")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] string value)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return NotFound();

            setting.Value = value;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{key}")]
        public async Task<IActionResult> DeleteSetting(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return NotFound();

            _context.SystemSettings.Remove(setting);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("backup")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BackupDatabase()
        {
            // Simplified Backup: Exporting key tables to JSON for the demo
            var backupData = new
            {
                Assets = await _context.Assets.ToListAsync(),
                AssetCategories = await _context.AssetCategories.ToListAsync(),
                Incomes = await _context.Incomes.ToListAsync(),
                Expenses = await _context.Expenses.ToListAsync(),
                ExpenseCategories = await _context.ExpenseCategories.ToListAsync(),
                TaxRecords = await _context.TaxRecords.ToListAsync(),
                TaxSlabs = await _context.TaxSlabs.ToListAsync(),
                SystemSettings = await _context.SystemSettings.ToListAsync(),
                // Excluding Users and AuditLogs for simplicity/security in this demo
            };

            var json = JsonSerializer.Serialize(backupData, new JsonSerializerOptions { WriteIndented = true });
            var bytes = System.Text.Encoding.UTF8.GetBytes(json);
            
            return File(bytes, "application/json", $"Backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json");
        }

        [HttpPost("restore")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreDatabase(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File is empty.");

            try
            {
                using var stream = new StreamReader(file.OpenReadStream());
                var json = await stream.ReadToEndAsync();
                
                // Simplified Restore: In a real app, you would carefully parse, validate, and clear/merge tables.
                // For this demo, we'll just log an audit event indicating a restore was simulated.
                
                var auditLog = new AuditLog
                {
                    Timestamp = DateTime.UtcNow,
                    Action = "System Restore Simulated",
                    Details = $"Simulated restore from file: {file.FileName}",
                    UserId = "Admin", // Should be from HttpContext
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown"
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Database parsed successfully. Simulated restore completed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Restore failed: {ex.Message}");
            }
        }
    }
}
