using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessTaxSystem.Backend.Models
{
    public class AssetCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    }

    public class Asset
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public int CategoryId { get; set; }
        public AssetCategory? Category { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PurchasePrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SalvageValue { get; set; }

        public int UsefulLifeYears { get; set; }

        public DateTime PurchaseDate { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public int CreatedByUserId { get; set; }
        public User? CreatedBy { get; set; }

        public string DepreciationMethod { get; set; } = "StraightLine"; // StraightLine, ReducingBalance
     
        public decimal CalculateDepreciation(int year)
        {
            if (year < PurchaseDate.Year) return 0;
            if (Status != "Approved" && Status != "In Use") return 0; // Only calculate string for approved assets
            
            int yearsSincePurchase = year - PurchaseDate.Year;
            
            if (yearsSincePurchase >= UsefulLifeYears) 
                return PurchasePrice - SalvageValue;

            if (DepreciationMethod == "ReducingBalance")
            {
                // Simple reducing balance estimation: Rate = 1 - ((SalvageValue / PurchasePrice) ^ (1/UsefulLifeYears))
                // For simplicity in this demo, let's use a fixed rate or simplified formula
                decimal depreciationRate = 1.0m - (decimal)Math.Pow((double)(SalvageValue / PurchasePrice), 1.0 / UsefulLifeYears);
                decimal bookValue = PurchasePrice;
                decimal accumulatedDepreciation = 0;

                for (int i = 0; i <= yearsSincePurchase; i++)
                {
                    decimal yearlyDepr = bookValue * depreciationRate;
                    accumulatedDepreciation += yearlyDepr;
                    bookValue -= yearlyDepr;
                }
                
                return accumulatedDepreciation > (PurchasePrice - SalvageValue) 
                    ? PurchasePrice - SalvageValue 
                    : accumulatedDepreciation;
            }
            else
            {
                // StraightLine
                decimal yearlyDepreciation = (PurchasePrice - SalvageValue) / UsefulLifeYears;
                return yearlyDepreciation * Math.Max(0, yearsSincePurchase + 1); 
            }
        }
    }

    public class DepreciationRecord
    {
        [Key]
        public int Id { get; set; }

        public int AssetId { get; set; }
        public Asset? Asset { get; set; }

        public int Year { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DepreciationAmount { get; set; }
    }
}
