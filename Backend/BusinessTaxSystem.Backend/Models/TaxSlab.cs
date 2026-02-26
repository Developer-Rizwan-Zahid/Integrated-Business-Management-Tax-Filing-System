using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessTaxSystem.Backend.Models
{
    public class TaxSlab
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxAmount { get; set; } // Null implies no upper limit

        [Required]
        [Column(TypeName = "decimal(5,4)")] // e.g., 0.0500 for 5%
        public decimal TaxRate { get; set; }
        
        public string? Description { get; set; }
    }
}
