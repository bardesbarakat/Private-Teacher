using System.ComponentModel.DataAnnotations;

namespace BEdu.API.DTOs.Curriculum;

public class TrackDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public List<ChapterDto> Chapters { get; set; } = new();
}

public class ChapterDto
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsPublished { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
    public List<ResourceDto> Resources { get; set; } = new();
}

public class LessonDto
{
    public int Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsPublished { get; set; }
    
    public string? VideoUrlAr { get; set; }
    public string? PdfUrlAr { get; set; }
    public string? VideoUrlEn { get; set; }
    public string? PdfUrlEn { get; set; }
    
    public List<ResourceDto> Resources { get; set; } = new();
    public int? ExamId { get; set; }
}

public class ResourceDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? UrlAr { get; set; }
    public string? UrlEn { get; set; }
}

// ---------------- Creation / Update DTOs ---------------- //

public class CreateTrackDto
{
    [Required]
    public int CourseId { get; set; }
    [Required]
    public string Type { get; set; } = string.Empty;
}

public class CreateChapterDto
{
    [Required]
    public int TrackId { get; set; }
    [Required]
    public string TitleAr { get; set; } = string.Empty;
    [Required]
    public string TitleEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsPublished { get; set; }
}

public class CreateLessonDto
{
    [Required]
    public int ChapterId { get; set; }
    [Required]
    public string TitleAr { get; set; } = string.Empty;
    [Required]
    public string TitleEn { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsPublished { get; set; }
    
    public string? VideoUrlAr { get; set; }
    public string? PdfUrlAr { get; set; }
    public string? VideoUrlEn { get; set; }
    public string? PdfUrlEn { get; set; }
}

public class CreateResourceDto
{
    public int? ChapterId { get; set; }
    public int? LessonId { get; set; }
    [Required]
    public string Type { get; set; } = string.Empty;
    [Required]
    public string TitleAr { get; set; } = string.Empty;
    [Required]
    public string TitleEn { get; set; } = string.Empty;
    public string? UrlAr { get; set; }
    public string? UrlEn { get; set; }
}
