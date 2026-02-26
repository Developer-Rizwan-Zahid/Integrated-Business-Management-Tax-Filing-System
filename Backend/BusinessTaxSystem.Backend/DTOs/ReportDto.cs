namespace BusinessTaxSystem.Backend.DTOs
{
    public class DashboardMetricsDto
    {
        public decimal TotalAssetValue { get; set; }
        public decimal CurrentYearProfit { get; set; }
        public decimal TotalDepreciation { get; set; }
        public decimal TaxPayable { get; set; }
        public List<CategoryDistributionDto> AssetDistribution { get; set; } = new();
    }

    public class CategoryDistributionDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalValue { get; set; }
    }

    public class ProfitLossReportDto
    {
        public int Year { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit => TotalIncome - TotalExpenses;
        public decimal TaxPaid { get; set; }
    }
}
