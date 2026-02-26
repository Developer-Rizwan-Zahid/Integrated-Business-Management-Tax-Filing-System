using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuditController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(logs);
        }

        [HttpPost("log")]
        [AllowAnonymous] // Internal calls or from any authenticated user depending on implementation
        public async Task<IActionResult> CreateLog([FromBody] AuditLog log)
        {
            // In a real application, UserId and IpAddress would be resolved from the HttpContext
            log.Timestamp = DateTime.UtcNow;
            
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
            return Ok(log);
        }
    }
}
