using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaxController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> _hubContext;

        public TaxController(AppDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost("calculate")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<TaxRecord>> CalculateTax(int year, [FromQuery] decimal? adjustedDepreciation = null)
        {
            // 1. Get Income
            var totalIncome = await _context.Incomes
                .Where(i => i.Date.Year == year && i.Status == "Approved")
                .SumAsync(i => i.Amount);

            // 2. Get Expenses
            var totalExpenses = await _context.Expenses
                .Where(e => e.Date.Year == year && e.Status == "Approved")
                .SumAsync(e => e.Amount);

            // 3. Get Depreciation
            decimal totalDepreciation;
            if (adjustedDepreciation.HasValue)
            {
                totalDepreciation = adjustedDepreciation.Value;
            }
            else
            {
                var assets = await _context.Assets.ToListAsync();
                totalDepreciation = assets.Sum(a => a.CalculateDepreciation(year));
            }

            // 4. Calculate Taxable Income
            var profit = totalIncome - totalExpenses;
            var taxableIncome = profit - totalDepreciation;
            if (taxableIncome < 0) taxableIncome = 0;

            // 5. Apply Dynamic Custom Slabs
            decimal taxAmount = 0;
            var slabs = await _context.TaxSlabs.OrderBy(s => s.MinAmount).ToListAsync();
            
            if (!slabs.Any())
            {
                // Fallback to default demo rules if no slabs are configured
                if (taxableIncome <= 100000)
                {
                    taxAmount = taxableIncome * 0.05m;
                }
                else if (taxableIncome <= 500000)
                {
                    taxAmount = (100000 * 0.05m) + ((taxableIncome - 100000) * 0.10m);
                }
                else
                {
                    taxAmount = (100000 * 0.05m) + (400000 * 0.10m) + ((taxableIncome - 500000) * 0.15m);
                }
            }
            else
            {
                var remainingIncome = taxableIncome;

                foreach (var slab in slabs)
                {
                    if (remainingIncome <= 0) break;

                    decimal slabRangeAmount = 0;
                    if (slab.MaxAmount.HasValue)
                    {
                        var slabSize = slab.MaxAmount.Value - slab.MinAmount;
                        slabRangeAmount = Math.Min(remainingIncome, slabSize);
                    }
                    else
                    {
                        slabRangeAmount = remainingIncome;
                    }

                    taxAmount += slabRangeAmount * slab.TaxRate;
                    remainingIncome -= slabRangeAmount;
                }
            }

            var taxRecord = new TaxRecord
            {
                Year = year,
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                TotalDepreciation = totalDepreciation,
                TaxableIncome = taxableIncome,
                TaxAmount = taxAmount,
                CalculatedDate = DateTime.UtcNow,
                Status = adjustedDepreciation.HasValue ? "Preview (Adjusted)" : "Draft"
            };

            if (!adjustedDepreciation.HasValue)
            {
                // Check if record exists for this year
                var existingRecord = await _context.TaxRecords.FirstOrDefaultAsync(t => t.Year == year);
                if (existingRecord != null)
                {
                    _context.TaxRecords.Remove(existingRecord);
                }

                _context.TaxRecords.Add(taxRecord);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("TaxChanged", new { action = "Calculated", year = taxRecord.Year, amount = taxRecord.TaxAmount });
            }

            return Ok(taxRecord);
        }

        [HttpGet("reports/{year}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<TaxRecord>> GetTaxReport(int year)
        {
            var record = await _context.TaxRecords.FirstOrDefaultAsync(t => t.Year == year);
            if (record == null) return NotFound("Tax report not calculated for this year.");
            return Ok(record);
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<IEnumerable<TaxRecord>>> GetAllReports()
        {
            return await _context.TaxRecords.OrderByDescending(t => t.Year).ToListAsync();
        }

        [HttpPut("override/{year}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ManualOverride(int year, [FromBody] decimal overrideAmount)
        {
            var record = await _context.TaxRecords.FirstOrDefaultAsync(t => t.Year == year);
            if (record == null) return NotFound("Tax record not found for this year.");

            record.TaxAmount = overrideAmount;
            record.Status = "Manual Override";
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.All.SendAsync("TaxChanged", new { action = "ManualOverride", year = record.Year, amount = record.TaxAmount });

            return NoContent();
        }

        // --- Tax Slabs CRUD ---

        [HttpGet("slabs")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<IEnumerable<TaxSlab>>> GetTaxSlabs()
        {
            return await _context.TaxSlabs.OrderBy(s => s.MinAmount).ToListAsync();
        }

        [HttpPost("slabs")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TaxSlab>> CreateTaxSlab(TaxSlab slab)
        {
            _context.TaxSlabs.Add(slab);
            await _context.SaveChangesAsync();
            return Ok(slab);
        }

        [HttpPut("slabs/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTaxSlab(int id, TaxSlab slab)
        {
            if (id != slab.Id) return BadRequest();
            _context.Entry(slab).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("slabs/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTaxSlab(int id)
        {
            var slab = await _context.TaxSlabs.FindAsync(id);
            if (slab == null) return NotFound();
            
            _context.TaxSlabs.Remove(slab);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
