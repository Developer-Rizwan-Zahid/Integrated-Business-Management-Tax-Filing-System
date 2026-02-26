using System.ComponentModel.DataAnnotations;

namespace BusinessTaxSystem.Backend.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? UserId { get; set; }

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        public string? Details { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
