using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BEdu.API.Models;

public class LessonProgress
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public User Student { get; set; } = null!;

    public int LessonId { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

    public bool IsCompleted { get; set; } = true;

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
