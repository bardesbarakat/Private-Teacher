using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BEdu.API.Models;

public class Course
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string? Level { get; set; } // Bac1 | Bac2 | General

    [MaxLength(255)]
    public string? ThumbnailUrl { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int TeacherId { get; set; }
    [ForeignKey(nameof(TeacherId))]
    public User Teacher { get; set; } = null!;

    public ICollection<Track> Tracks { get; set; } = new List<Track>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
}

public class Track
{
    public int Id { get; set; }
    
    [Required, MaxLength(50)]
    public string Type { get; set; } = "Theoretical"; // Theoretical | Practical

    public int CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;

    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
}

public class Chapter
{
    public int Id { get; set; }
    
    [Required, MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;

    public int OrderIndex { get; set; } = 0;
    
    public bool IsPublished { get; set; } = false;

    public int TrackId { get; set; }
    [ForeignKey(nameof(TrackId))]
    public Track Track { get; set; } = null!;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<SupplementaryResource> Resources { get; set; } = new List<SupplementaryResource>();
}

public class Lesson
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;

    public int OrderIndex { get; set; } = 0;
    
    public bool IsPublished { get; set; } = false;

    // Bilingual Core Content AR
    [MaxLength(500)]
    public string? VideoUrlAr { get; set; }
    [MaxLength(500)]
    public string? PdfUrlAr { get; set; }

    // Bilingual Core Content EN
    [MaxLength(500)]
    public string? VideoUrlEn { get; set; }
    [MaxLength(500)]
    public string? PdfUrlEn { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ChapterId { get; set; }
    [ForeignKey(nameof(ChapterId))]
    public Chapter Chapter { get; set; } = null!;

    public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    public ICollection<SupplementaryResource> Resources { get; set; } = new List<SupplementaryResource>();
    
    // Access Control
    public ICollection<LessonActivationCode> ActivationCodes { get; set; } = new List<LessonActivationCode>();
    public ICollection<StudentLessonAccess> StudentAccesses { get; set; } = new List<StudentLessonAccess>();
}

public class SupplementaryResource
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Type { get; set; } = "Link"; // Link | Github | Document | File

    [Required, MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? UrlAr { get; set; }

    [MaxLength(1000)]
    public string? UrlEn { get; set; }

    public int? ChapterId { get; set; }
    [ForeignKey(nameof(ChapterId))]
    public Chapter? Chapter { get; set; }

    public int? LessonId { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson? Lesson { get; set; }
}

public class Enrollment
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public User Student { get; set; } = null!;

    public int CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public Course Course { get; set; } = null!;

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active | Completed
}
