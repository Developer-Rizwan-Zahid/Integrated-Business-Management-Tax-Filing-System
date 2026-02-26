using BusinessTaxSystem.Backend.Data;
using BusinessTaxSystem.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessTaxSystem.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeedController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("expense-categories")]
        public async Task<IActionResult> SeedExpenseCategories()
        {
            if (await _context.ExpenseCategories.AnyAsync())
            {
                return Ok(new { message = "Expense categories already exist." });
            }

            var categories = new List<ExpenseCategory>
            {
                new ExpenseCategory { Name = "Office Supplies" },
                new ExpenseCategory { Name = "Utilities" },
                new ExpenseCategory { Name = "Rent" },
                new ExpenseCategory { Name = "Travel" },
                new ExpenseCategory { Name = "Marketing" },
                new ExpenseCategory { Name = "Professional Services" },
                new ExpenseCategory { Name = "Equipment" },
                new ExpenseCategory { Name = "Other" }
            };

            _context.ExpenseCategories.AddRange(categories);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Successfully seeded {categories.Count} expense categories.", categories });
        }
    }
}
