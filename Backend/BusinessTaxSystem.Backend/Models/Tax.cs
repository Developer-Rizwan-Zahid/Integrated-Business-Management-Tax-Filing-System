using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessTaxSystem.Backend.Models
{
    public class TaxRecord
    {
        [Key]
        public int Id { get; set; }

        public int Year { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalIncome { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalExpenses { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalDepreciation { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxableIncome { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        public DateTime CalculatedDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Draft"; // Draft, Submitted, Paid
    }
}
