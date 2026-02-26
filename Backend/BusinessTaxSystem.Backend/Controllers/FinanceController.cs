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
    public class FinanceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> _hubContext;

        public FinanceController(AppDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<BusinessTaxSystem.Backend.Hubs.DashboardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }

        private bool IsStaff() => User.IsInRole("Staff");

        [HttpGet("summary")]
        public async Task<ActionResult<FinanceSummaryDto>> GetSummary([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var incomeQuery = _context.Incomes.Where(i => i.Status == "Approved");
            var expenseQuery = _context.Expenses.Where(e => e.Status == "Approved");

            if (IsStaff())
            {
                var userId = GetCurrentUserId();
                incomeQuery = incomeQuery.Where(i => i.CreatedByUserId == userId);
                expenseQuery = expenseQuery.Where(e => e.CreatedByUserId == userId);
            }

            if (startDate.HasValue)
            {
                var start = startDate.Value.Kind == DateTimeKind.Utc ? startDate.Value : startDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date >= start);
                expenseQuery = expenseQuery.Where(e => e.Date >= start);
            }

            if (endDate.HasValue)
            {
                var end = endDate.Value.Kind == DateTimeKind.Utc ? endDate.Value : endDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date <= end);
                expenseQuery = expenseQuery.Where(e => e.Date <= end);
            }

            var totalIncome = await incomeQuery.SumAsync(i => i.Amount);
            var totalExpenses = await expenseQuery.SumAsync(e => e.Amount);

            return Ok(new FinanceSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses
            });
        }

        [HttpPost("income")]
        [Authorize(Roles = "Admin,Accountant,Staff")]
        public async Task<ActionResult<Income>> AddIncome(IncomeDto incomeDto)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized("User ID not found in token.");
            }

            if (await IsPeriodClosed(incomeDto.Date))
            {
                return BadRequest("Cannot add income to a closed financial period.");
            }

            var income = new Income
            {
                Amount = incomeDto.Amount,
                Source = incomeDto.Source,
                Date = incomeDto.Date.Kind == DateTimeKind.Utc ? incomeDto.Date : incomeDto.Date.ToUniversalTime(),
                Status = "Pending",
                CreatedByUserId = userId
            };

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "IncomeAdded", amount = income.Amount, source = income.Source });

            return Ok(income);
        }

        [HttpPost("expense")]
        [Authorize(Roles = "Admin,Accountant,Staff")]
        public async Task<ActionResult<Expense>> AddExpense(ExpenseDto expenseDto)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized("User ID not found in token.");
            }

            if (await IsPeriodClosed(expenseDto.Date))
            {
                return BadRequest("Cannot add expense to a closed financial period.");
            }

            // Ensure at least one category exists (seed if needed)
            if (!await _context.ExpenseCategories.AnyAsync())
            {
                _context.ExpenseCategories.AddRange(
                    new ExpenseCategory { Name = "Office Supplies" },
                    new ExpenseCategory { Name = "Utilities" },
                    new ExpenseCategory { Name = "Rent" },
                    new ExpenseCategory { Name = "Travel" },
                    new ExpenseCategory { Name = "Marketing" },
                    new ExpenseCategory { Name = "Professional Services" },
                    new ExpenseCategory { Name = "Equipment" },
                    new ExpenseCategory { Name = "Other" }
                );
                await _context.SaveChangesAsync();
            }

            // Validate category exists, if not use first available category
            var category = await _context.ExpenseCategories.FindAsync(expenseDto.CategoryId);
            if (category == null)
            {
                // Get first available category
                category = await _context.ExpenseCategories.FirstOrDefaultAsync();
                if (category == null)
                {
                    // This should never happen after seeding, but just in case
                    category = new ExpenseCategory { Name = "Other" };
                    _context.ExpenseCategories.Add(category);
                    await _context.SaveChangesAsync();
                }
                expenseDto.CategoryId = category.Id;
            }

            var expense = new Expense
            {
                Amount = expenseDto.Amount,
                CategoryId = expenseDto.CategoryId,
                Description = expenseDto.Description,
                Date = expenseDto.Date.Kind == DateTimeKind.Utc ? expenseDto.Date : expenseDto.Date.ToUniversalTime(),
                Status = "Pending",
                CreatedByUserId = userId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "ExpenseAdded", amount = expense.Amount, description = expense.Description });

            return Ok(expense);
        }

        [HttpGet("transactions")]
        public async Task<ActionResult> GetTransactions([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var incomeQuery = _context.Incomes.AsQueryable();
            var expenseQuery = _context.Expenses.AsQueryable();

            if (IsStaff())
            {
                var userId = GetCurrentUserId();
                incomeQuery = incomeQuery.Where(i => i.CreatedByUserId == userId);
                expenseQuery = expenseQuery.Where(e => e.CreatedByUserId == userId);
            }

            if (startDate.HasValue)
            {
                var start = startDate.Value.Kind == DateTimeKind.Utc ? startDate.Value : startDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date >= start);
                expenseQuery = expenseQuery.Where(e => e.Date >= start);
            }

            if (endDate.HasValue)
            {
                var end = endDate.Value.Kind == DateTimeKind.Utc ? endDate.Value : endDate.Value.ToUniversalTime();
                incomeQuery = incomeQuery.Where(i => i.Date <= end);
                expenseQuery = expenseQuery.Where(e => e.Date <= end);
            }

            var incomes = await incomeQuery
                .OrderByDescending(i => i.Date)
                .Take(10)
                .Select(i => new { id = i.Id, type = "income", source = i.Source, amount = i.Amount, date = i.Date, status = i.Status })
                .ToListAsync();

            var expenses = await expenseQuery
                .OrderByDescending(e => e.Date)
                .Take(10)
                .Select(e => new { id = e.Id, type = "expense", source = e.Description, amount = e.Amount, date = e.Date, status = e.Status })
                .ToListAsync();

            var all = incomes.Concat(expenses).OrderByDescending(x => x.date).Take(15);
            return Ok(all);
        }

        [HttpGet("expenses/categories")]
        public async Task<ActionResult<IEnumerable<ExpenseCategory>>> GetExpenseCategories()
        {
            return await _context.ExpenseCategories.ToListAsync();
        }

        [HttpGet("expenses/by-category")]
        public async Task<ActionResult> GetExpenseByCategory([FromQuery] int? year)
        {
            var targetYear = year ?? DateTime.Now.Year;
            var expenseData = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.Date.Year == targetYear && e.Status == "Approved")
                .GroupBy(e => e.Category != null ? e.Category.Name : "Uncategorized")
                .Select(g => new { name = g.Key, value = g.Sum(e => e.Amount) })
                .ToListAsync();

            return Ok(expenseData);
        }

        [HttpPost("expenses/categories")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<ActionResult<ExpenseCategory>> CreateExpenseCategory(ExpenseCategory category)
        {
            _context.ExpenseCategories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPost("close-period")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> ClosePeriod([FromQuery] int year, [FromQuery] int month)
        {
            var period = await _context.FinancialPeriods
                .FirstOrDefaultAsync(p => p.Year == year && p.Month == month);

            if (period == null)
            {
                period = new FinancialPeriod
                {
                    Year = year,
                    Month = month,
                    IsClosed = true,
                    ClosedDate = DateTime.UtcNow,
                    ClosedBy = User.Identity?.Name ?? "System"
                };
                _context.FinancialPeriods.Add(period);
            }
            else
            {
                period.IsClosed = true;
                period.ClosedDate = DateTime.UtcNow;
                period.ClosedBy = User.Identity?.Name ?? "System";
            }

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "PeriodClosed", year, month });

            return Ok(new { message = $"Financial period {month}/{year} closed successfully." });
        }

        [HttpPost("open-period")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> OpenPeriod([FromQuery] int year, [FromQuery] int month)
        {
            var period = await _context.FinancialPeriods
                .FirstOrDefaultAsync(p => p.Year == year && p.Month == month);

            if (period != null)
            {
                period.IsClosed = false;
                period.ClosedDate = null;
                period.ClosedBy = null;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "PeriodOpened", year, month });
            }

            return Ok(new { message = $"Financial period {month}/{year} opened successfully." });
        }

        private async Task<bool> IsPeriodClosed(DateTime date)
        {
            return await _context.FinancialPeriods
                .AnyAsync(p => p.Year == date.Year && p.Month == date.Month && p.IsClosed);
        }

        [HttpPut("income/{id}/status")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateIncomeStatus(int id, [FromBody] string status)
        {
            var income = await _context.Incomes.FindAsync(id);
            if (income == null) return NotFound();

            income.Status = status; // Pending, Approved, Rejected
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "IncomeStatusUpdated", id, status });
            return NoContent();
        }

        [HttpPut("expense/{id}/status")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateExpenseStatus(int id, [FromBody] string status)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            expense.Status = status; // Pending, Approved, Rejected
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("FinanceChanged", new { action = "ExpenseStatusUpdated", id, status });
            return NoContent();
        }
    }
}
