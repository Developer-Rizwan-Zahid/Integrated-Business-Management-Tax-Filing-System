using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessTaxSystem.Backend.Models
{
    public class Income
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(200)]
        public string Source { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public int CreatedByUserId { get; set; }
        public User? CreatedBy { get; set; }
    }

    public class ExpenseCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }

    public class Expense
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public int CategoryId { get; set; }
        public ExpenseCategory? Category { get; set; }

        public string Description { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public int CreatedByUserId { get; set; }
        public User? CreatedBy { get; set; }
    }
}
