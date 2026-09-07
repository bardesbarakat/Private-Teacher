using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BEdu.API.Models;

public class LessonActivationCode
{
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    public int LessonId { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

    public int? RedeemedByStudentId { get; set; }
    [ForeignKey(nameof(RedeemedByStudentId))]
    public User? RedeemedByStudent { get; set; }

    public DateTime? RedeemedAt { get; set; }

    public bool IsUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }
}

public class StudentLessonAccess
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public User Student { get; set; } = null!;

    public int LessonId { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}
