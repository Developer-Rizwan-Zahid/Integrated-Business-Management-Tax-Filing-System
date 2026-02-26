namespace BusinessTaxSystem.Backend.DTOs
{
    public class AssetCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal SalvageValue { get; set; }
        public int UsefulLifeYears { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string DepreciationMethod { get; set; } = "StraightLine"; // StraightLine, ReducingBalance
    }

    public class AssetResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal PurchasePrice { get; set; }
        public decimal SalvageValue { get; set; }
        public int UsefulLifeYears { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string DepreciationMethod { get; set; } = string.Empty;
        public decimal CurrentDepreciation { get; set; }
    }
}
