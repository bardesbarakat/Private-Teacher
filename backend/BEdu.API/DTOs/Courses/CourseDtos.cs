namespace BEdu.API.DTOs.Courses;

// --- Course DTOs ---
public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Level { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public class UpdateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Level { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsPublished { get; set; }
}

public class CourseResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Level { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public int LessonCount { get; set; }
}

// --- Lesson DTOs ---
public class CreateLessonDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public string? PdfUrl { get; set; }
    public int Order { get; set; }
}

public class LessonResponseDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public string? PdfUrl { get; set; }
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
}

// --- Enrollment DTOs ---
public class EnrollRequestDto
{
    public int CourseId { get; set; }
}

public class EnrollmentResponseDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
