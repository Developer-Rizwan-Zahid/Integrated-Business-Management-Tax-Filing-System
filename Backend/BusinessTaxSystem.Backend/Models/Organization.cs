using System.ComponentModel.DataAnnotations;

namespace BusinessTaxSystem.Backend.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        public ICollection<AssetAssignment> Assignments { get; set; } = new List<AssetAssignment>();
    }

    public class AssetAssignment
    {
        [Key]
        public int Id { get; set; }

        public int AssetId { get; set; }
        public Asset? Asset { get; set; }

        public int DepartmentId { get; set; }
        public Department? Department { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ReturnDate { get; set; }

        public string? EmployeeName { get; set; }
    }
}
