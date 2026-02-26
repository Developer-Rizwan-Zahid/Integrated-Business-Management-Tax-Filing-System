namespace BusinessTaxSystem.Backend.DTOs
{
    public class IncomeDto
    {
        public decimal Amount { get; set; }
        public string Source { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class ExpenseDto
    {
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class FinanceSummaryDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit => TotalIncome - TotalExpenses;
    }
}
