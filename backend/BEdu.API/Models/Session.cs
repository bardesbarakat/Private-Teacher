using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BEdu.API.Models;

public class LiveSession
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public DateTime ScheduledAt { get; set; }
    
    public int DurationMinutes { get; set; } = 60;

    [MaxLength(500)]
    public string? JoinUrl { get; set; }

    public bool IsCompleted { get; set; } = false;
    
    public int? CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public Course? Course { get; set; }

    public ICollection<SessionAttendance> Attendances { get; set; } = new List<SessionAttendance>();
}

public class SessionAttendance
{
    public int Id { get; set; }

    public int SessionId { get; set; }
    [ForeignKey(nameof(SessionId))]
    public LiveSession Session { get; set; } = null!;

    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public User Student { get; set; } = null!;

    public DateTime AttendedAt { get; set; } = DateTime.UtcNow;
}
