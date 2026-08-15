using System.Security.Claims;
using BEdu.API.Data;
using BEdu.API.DTOs.Curriculum;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurriculumController : ControllerBase
{
    private readonly AppDbContext _db;
    public CurriculumController(AppDbContext db) => _db = db;

    // GET /api/curriculum/course/{courseId}
    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetCourseCurriculum(int courseId, [FromQuery] bool includeDrafts = false)
    {
        var course = await _db.Courses
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters.OrderBy(ch => ch.OrderIndex))
                .ThenInclude(ch => ch.Lessons.OrderBy(l => l.OrderIndex))
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters)
                .ThenInclude(ch => ch.Resources)
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters)
                .ThenInclude(ch => ch.Lessons)
                .ThenInclude(l => l.Resources)
            .Include(c => c.Exams)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return NotFound(new { message = "الكورس غير موجود" });

        var isTeacher = User.Identity?.IsAuthenticated == true && User.IsInRole("Teacher") && course.TeacherId == int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var showDrafts = includeDrafts && isTeacher;

        var tracks = course.Tracks.Select(t => new TrackDto
        {
            Id = t.Id,
            Type = t.Type,
            Chapters = t.Chapters
                .Where(ch => showDrafts || ch.IsPublished)
                .Select(ch => new ChapterDto
                {
                    Id = ch.Id,
                    TitleAr = ch.TitleAr,
                    TitleEn = ch.TitleEn,
                    OrderIndex = ch.OrderIndex,
                    IsPublished = ch.IsPublished,
                    Resources = ch.Resources.Select(r => new ResourceDto
                    {
                        Id = r.Id, Type = r.Type, TitleAr = r.TitleAr, TitleEn = r.TitleEn, UrlAr = r.UrlAr, UrlEn = r.UrlEn
                    }).ToList(),
                    Lessons = ch.Lessons
                        .Where(l => showDrafts || l.IsPublished)
                        .Select(l => new LessonDto
                        {
                            Id = l.Id,
                            TitleAr = l.TitleAr,
                            TitleEn = l.TitleEn,
                            OrderIndex = l.OrderIndex,
                            IsPublished = l.IsPublished,
                            VideoUrlAr = l.VideoUrlAr,
                            VideoUrlEn = l.VideoUrlEn,
                            PdfUrlAr = l.PdfUrlAr,
                            PdfUrlEn = l.PdfUrlEn,
                            ExamId = l.Exams.FirstOrDefault()?.Id,
                            Resources = l.Resources.Select(r => new ResourceDto
                            {
                                Id = r.Id, Type = r.Type, TitleAr = r.TitleAr, TitleEn = r.TitleEn, UrlAr = r.UrlAr, UrlEn = r.UrlEn
                            }).ToList()
                        }).ToList()
                }).ToList()
        }).ToList();

        return Ok(tracks);
    }

    // POST /api/curriculum/tracks
    [HttpPost("tracks")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateTrack([FromBody] CreateTrackDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);
        if (course == null) return Forbid();

        var track = new Track { CourseId = dto.CourseId, Type = dto.Type };
        _db.Tracks.Add(track);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة المسار", id = track.Id });
    }

    // POST /api/curriculum/chapters
    [HttpPost("chapters")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateChapter([FromBody] CreateChapterDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var track = await _db.Tracks.Include(t => t.Course).FirstOrDefaultAsync(t => t.Id == dto.TrackId);
        if (track == null || track.Course.TeacherId != teacherId) return Forbid();

        var chapter = new Chapter
        {
            TrackId = dto.TrackId,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            OrderIndex = dto.OrderIndex,
            IsPublished = dto.IsPublished
        };
        _db.Chapters.Add(chapter);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة الفصل", id = chapter.Id });
    }

    // PUT /api/curriculum/chapters/{id}
    [HttpPut("chapters/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> UpdateChapter(int id, [FromBody] CreateChapterDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == id);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        chapter.TitleAr = dto.TitleAr.Trim();
        chapter.TitleEn = dto.TitleEn.Trim();
        chapter.OrderIndex = dto.OrderIndex;
        chapter.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الفصل" });
    }

    // POST /api/curriculum/lessons
    [HttpPost("lessons")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == dto.ChapterId);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        var lesson = new Lesson
        {
            ChapterId = dto.ChapterId,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            OrderIndex = dto.OrderIndex,
            IsPublished = dto.IsPublished,
            VideoUrlAr = dto.VideoUrlAr,
            VideoUrlEn = dto.VideoUrlEn,
            PdfUrlAr = dto.PdfUrlAr,
            PdfUrlEn = dto.PdfUrlEn
        };
        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة الدرس", id = lesson.Id });
    }

    // PUT /api/curriculum/lessons/{id}
    [HttpPut("lessons/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> UpdateLesson(int id, [FromBody] CreateLessonDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();

        lesson.TitleAr = dto.TitleAr.Trim();
        lesson.TitleEn = dto.TitleEn.Trim();
        lesson.OrderIndex = dto.OrderIndex;
        lesson.IsPublished = dto.IsPublished;
        lesson.VideoUrlAr = dto.VideoUrlAr;
        lesson.VideoUrlEn = dto.VideoUrlEn;
        lesson.PdfUrlAr = dto.PdfUrlAr;
        lesson.PdfUrlEn = dto.PdfUrlEn;

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الدرس" });
    }

    // POST /api/curriculum/resources
    [HttpPost("resources")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> AddResource([FromBody] CreateResourceDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        if (dto.ChapterId.HasValue)
        {
            var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == dto.ChapterId);
            if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();
        }
        else if (dto.LessonId.HasValue)
        {
            var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == dto.LessonId);
            if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();
        }
        else
        {
            return BadRequest(new { message = "يجب تحديد فصل أو درس لإضافة المصدر إليه" });
        }

        var resource = new SupplementaryResource
        {
            ChapterId = dto.ChapterId,
            LessonId = dto.LessonId,
            Type = dto.Type,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            UrlAr = dto.UrlAr,
            UrlEn = dto.UrlEn
        };

        _db.SupplementaryResources.Add(resource);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تمت إضافة المصدر", id = resource.Id });
    }

    // DELETE endpoints for Chapter, Lesson, Resource (Optional but needed)
    [HttpDelete("chapters/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteChapter(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == id);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        _db.Chapters.Remove(chapter);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الفصل" });
    }

    [HttpDelete("lessons/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteLesson(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الدرس" });
    }
}
