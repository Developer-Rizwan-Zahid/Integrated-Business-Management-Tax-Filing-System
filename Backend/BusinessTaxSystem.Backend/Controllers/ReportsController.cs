using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.DTOs;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Accountant")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetrics()
        {
            var currentYear = DateTime.Now.Year;

            // Total Assets Value
            var totalAssetValue = await _context.Assets.SumAsync(a => a.PurchasePrice);

            // Current Year Profit
            var totalIncome = await _context.Incomes
                .Where(i => i.Date.Year == currentYear)
                .SumAsync(i => i.Amount);
            var totalExpenses = await _context.Expenses
                .Where(e => e.Date.Year == currentYear)
                .SumAsync(e => e.Amount);
            var currentYearProfit = totalIncome - totalExpenses;

            // Total Depreciation
            var assets = await _context.Assets.ToListAsync();
            var totalDepreciation = assets.Sum(a => a.CalculateDepreciation(currentYear));

            // Tax Payable (from last calculated record for current year)
            var taxRecord = await _context.TaxRecords
                .Where(t => t.Year == currentYear)
                .FirstOrDefaultAsync();
            var taxPayable = taxRecord?.TaxAmount ?? 0;

            // Asset Distribution
            var distribution = await _context.Assets
                .Include(a => a.Category)
                .GroupBy(a => a.Category != null ? a.Category.Name : "Uncategorized")
                .Select(g => new CategoryDistributionDto
                {
                    CategoryName = g.Key,
                    TotalValue = g.Sum(a => a.PurchasePrice)
                })
                .ToListAsync();

            return Ok(new DashboardMetricsDto
            {
                TotalAssetValue = totalAssetValue,
                CurrentYearProfit = currentYearProfit,
                TotalDepreciation = totalDepreciation,
                TaxPayable = taxPayable,
                AssetDistribution = distribution
            });
        }

        [HttpGet("profit-loss")]
        public async Task<ActionResult<IEnumerable<ProfitLossReportDto>>> GetProfitLossReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var incomeQuery = _context.Incomes.Where(i => i.Status == "Approved");
            var expenseQuery = _context.Expenses.Where(e => e.Status == "Approved");
            var taxQuery = _context.TaxRecords.AsQueryable();

            if (startDate.HasValue)
            {
                var start = startDate.Value.Kind == DateTimeKind.Utc ? startDate.Value : startDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date >= start);
                expenseQuery = expenseQuery.Where(e => e.Date >= start);
                taxQuery = taxQuery.Where(t => t.Year >= start.Year);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.Kind == DateTimeKind.Utc ? endDate.Value : endDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date <= end);
                expenseQuery = expenseQuery.Where(e => e.Date <= end);
                taxQuery = taxQuery.Where(t => t.Year <= end.Year);
            }

            var incomeByYear = await incomeQuery
                .GroupBy(i => i.Date.Year)
                .Select(g => new { Year = g.Key, Total = g.Sum(i => i.Amount) })
                .ToListAsync();

            var expensesByYear = await expenseQuery
                .GroupBy(e => e.Date.Year)
                .Select(g => new { Year = g.Key, Total = g.Sum(e => e.Amount) })
                .ToListAsync();

            var taxByYear = await taxQuery
                .Select(t => new { t.Year, t.TaxAmount })
                .ToListAsync();

            var allYears = incomeByYear.Select(i => i.Year)
                .Union(expensesByYear.Select(e => e.Year))
                .Distinct()
                .OrderByDescending(y => y);

            var report = allYears.Select(year => new ProfitLossReportDto
            {
                Year = year,
                TotalIncome = incomeByYear.FirstOrDefault(i => i.Year == year)?.Total ?? 0,
                TotalExpenses = expensesByYear.FirstOrDefault(e => e.Year == year)?.Total ?? 0,
                TaxPaid = taxByYear.FirstOrDefault(t => t.Year == year)?.TaxAmount ?? 0
            }).ToList();

            return Ok(report);
        }

        [HttpGet("assets")]
        public async Task<ActionResult<IEnumerable<AssetResponseDto>>> GetDetailedAssetReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var currentYear = DateTime.Now.Year;
            var query = _context.Assets.Include(a => a.Category).AsQueryable();

            if (startDate.HasValue)
            {
                var start = startDate.Value.Kind == DateTimeKind.Utc ? startDate.Value : startDate.Value.ToUniversalTime();
                query = query.Where(a => a.PurchaseDate >= start);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.Kind == DateTimeKind.Utc ? endDate.Value : endDate.Value.ToUniversalTime();
                query = query.Where(a => a.PurchaseDate <= end);
            }

            return await query
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
                    CurrentDepreciation = a.CalculateDepreciation(currentYear)
                })
                .ToListAsync();
        }

        [HttpGet("tax-summary")]
        public async Task<ActionResult<IEnumerable<TaxRecord>>> GetTaxSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.TaxRecords.AsQueryable();
            
            if (startDate.HasValue) query = query.Where(t => t.Year >= startDate.Value.Year);
            if (endDate.HasValue) query = query.Where(t => t.Year <= endDate.Value.Year);

            return await query
                .OrderByDescending(t => t.Year)
                .ToListAsync();
        }

        [HttpGet("export/{type}")]
        public IActionResult ExportReport(string type)
        {
            // Placeholder for PDF/Excel export logic
            // In a real scenario, you'd use libraries like iTextSharp or ClosedXML
            if (type.ToLower() == "pdf")
            {
                return File(new byte[0], "application/pdf", "report.pdf");
            }
            else if (type.ToLower() == "excel")
            {
                return File(new byte[0], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "report.xlsx");
            }
            return BadRequest("Unsupported export type.");
        }
    }
}
