using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class User
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [MaxLength(20)]
    public string? Phone { get; set; }
    public string Grade { get; set; } = "bac1"; // bac1 | bac2
    public string Role { get; set; } = "Student"; // Student | Teacher | Admin
    public string? City { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation
    public ICollection<Enrollment> Enrollments { get; set; } = [];
    public ICollection<ExamResult> ExamResults { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
}

public class Course
{
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Category { get; set; } = "bac1"; // bac1 | bac2 | intensive
    public string Level { get; set; } = "beginner"; // beginner | intermediate | advanced
    public string? ImageUrl { get; set; }
    public string? TelegramUrl { get; set; }
    public bool IsFree { get; set; } = true;
    public decimal Price { get; set; } = 0;
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Order { get; set; } = 0;

    // Navigation
    public ICollection<Lesson> Lessons { get; set; } = [];
    public ICollection<Enrollment> Enrollments { get; set; } = [];
    public ICollection<Exam> Exams { get; set; } = [];
    public ICollection<CourseFeature> Features { get; set; } = [];
}

public class CourseFeature
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Order { get; set; }
    public Course Course { get; set; } = null!;
}

public class Lesson
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public string? TranscriptText { get; set; }
    public int DurationSeconds { get; set; } = 0;
    public int Order { get; set; } = 0;
    public string ChapterTitle { get; set; } = string.Empty;
    public int ChapterOrder { get; set; } = 1;
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Course Course { get; set; } = null!;
    public ICollection<LessonProgress> Progresses { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
    public ICollection<LessonResource> Resources { get; set; } = [];
}

public class LessonResource
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = "pdf"; // pdf | link | video
    public long FileSizeBytes { get; set; }
    public Lesson Lesson { get; set; } = null!;
}

public class Enrollment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CourseId { get; set; }
    public float Progress { get; set; } = 0; // 0-100
    public int CompletedLessons { get; set; } = 0;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}

public class LessonProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int LessonId { get; set; }
    public bool IsCompleted { get; set; } = false;
    public int WatchedSeconds { get; set; } = 0;
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}

public class Note
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int LessonId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}

public class Exam
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TimeLimitMinutes { get; set; } = 20;
    public int PassingScore { get; set; } = 60;
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Course Course { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<ExamResult> Results { get; set; } = [];
}

public class Question
{
    public int Id { get; set; }
    public int ExamId { get; set; }
    [Required]
    public string Text { get; set; } = string.Empty;
    public string? CodeBlock { get; set; }
    [Required]
    public string OptionA { get; set; } = string.Empty;
    [Required]
    public string OptionB { get; set; } = string.Empty;
    [Required]
    public string OptionC { get; set; } = string.Empty;
    [Required]
    public string OptionD { get; set; } = string.Empty;
    [Required]
    public string CorrectOption { get; set; } = "A"; // A | B | C | D
    public string? Explanation { get; set; }
    public int Order { get; set; } = 0;

    public Exam Exam { get; set; } = null!;
}

public class ExamResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ExamId { get; set; }
    public float Score { get; set; } = 0; // 0-100
    public int CorrectAnswers { get; set; }
    public int TotalQuestions { get; set; }
    public int TimeTakenSeconds { get; set; }
    public string AnswersJson { get; set; } = "{}"; // {"questionId": "selectedOption"}
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Exam Exam { get; set; } = null!;
}
