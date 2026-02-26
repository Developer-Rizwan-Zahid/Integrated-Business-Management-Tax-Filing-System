using System.ComponentModel.DataAnnotations;

namespace BusinessTaxSystem.Backend.Models
{
    public class FinancialPeriod
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; } // 1-12

        public bool IsClosed { get; set; } = false;

        public DateTime? ClosedDate { get; set; }

        public string? ClosedBy { get; set; }
    }
}
