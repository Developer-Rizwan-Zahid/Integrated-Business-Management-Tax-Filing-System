using BusinessTaxSystem.Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RemindersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RemindersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("late-months")]
        public async Task<ActionResult<IEnumerable<string>>> GetLateMonths(int? year)
        {
            var targetYear = year ?? DateTime.Now.Year;
            var lateMonths = new List<string>();

            // We only check months that have passed in the current year
            int maxMonth = (targetYear == DateTime.Now.Year) ? DateTime.Now.Month : 12;

            for (int m = 1; m <= maxMonth; m++)
            {
                bool hasIncome = await _context.Incomes.AnyAsync(i => i.Date.Year == targetYear && i.Date.Month == m);
                bool hasExpense = await _context.Expenses.AnyAsync(e => e.Date.Year == targetYear && e.Date.Month == m);

                if (!hasIncome && !hasExpense)
                {
                    lateMonths.Add(new DateTime(targetYear, m, 1).ToString("MMMM"));
                }
            }

            return Ok(lateMonths);
        }
    }
}
