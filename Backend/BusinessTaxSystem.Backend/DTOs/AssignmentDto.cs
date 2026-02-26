namespace BusinessTaxSystem.Backend.DTOs
{
    public class AssetAssignmentDto
    {
        public int AssetId { get; set; }
        public int DepartmentId { get; set; }
        public string? EmployeeName { get; set; }
    }

    public class AssetAssignmentResponseDto
    {
        public int Id { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string? EmployeeName { get; set; }
    }
}
