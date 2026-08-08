using System.ComponentModel.DataAnnotations;

namespace BEdu.API.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string FullNameAr { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string FullNameEn { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Role { get; set; } = string.Empty; // Student | Teacher | Parent

    [Required, MaxLength(100)]
    public string Governorate { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? AcademicYear { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<ExamSubmission> ExamSubmissions { get; set; } = new List<ExamSubmission>();
}
