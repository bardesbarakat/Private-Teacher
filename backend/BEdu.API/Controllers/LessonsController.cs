using System.Security.Claims;
using BEdu.API.Data;
using BEdu.API.DTOs.Courses;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase
{
    private readonly AppDbContext _db;
    public LessonsController(AppDbContext db) => _db = db;

    // GET /api/lessons/course/{courseId}
    [HttpGet("course/{courseId}")]
    [Authorize]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        var lessons = await _db.Lessons
            .Include(l => l.Course)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Order)
            .Select(l => new LessonResponseDto
            {
                Id = l.Id,
                CourseId = l.CourseId,
                CourseTitle = l.Course.Title,
                Title = l.Title,
                Content = l.Content,
                VideoUrl = l.VideoUrl,
                PdfUrl = l.PdfUrl,
                Order = l.Order,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(lessons);
    }

    // GET /api/lessons/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var lesson = await _db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null) return NotFound(new { message = "الدرس غير موجود" });

        return Ok(new LessonResponseDto
        {
            Id = lesson.Id,
            CourseId = lesson.CourseId,
            CourseTitle = lesson.Course.Title,
            Title = lesson.Title,
            Content = lesson.Content,
            VideoUrl = lesson.VideoUrl,
            PdfUrl = lesson.PdfUrl,
            Order = lesson.Order,
            CreatedAt = lesson.CreatedAt
        });
    }

    // POST /api/lessons
    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateLessonDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "عنوان الدرس مطلوب" });

        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var courseOwned = await _db.Courses.AnyAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);
        if (!courseOwned) return Forbid();

        var lesson = new Lesson
        {
            CourseId = dto.CourseId,
            Title = dto.Title.Trim(),
            Content = dto.Content,
            VideoUrl = dto.VideoUrl,
            PdfUrl = dto.PdfUrl,
            Order = dto.Order
        };
        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = lesson.Id },
            new { message = "تم إضافة الدرس بنجاح", id = lesson.Id });
    }

    // PUT /api/lessons/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateLessonDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Course.TeacherId != teacherId)
            return NotFound(new { message = "الدرس غير موجود أو ليس لديك صلاحية" });

        lesson.Title = dto.Title.Trim();
        lesson.Content = dto.Content;
        lesson.VideoUrl = dto.VideoUrl;
        lesson.PdfUrl = dto.PdfUrl;
        lesson.Order = dto.Order;
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الدرس" });
    }

    // DELETE /api/lessons/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Course.TeacherId != teacherId)
            return NotFound(new { message = "الدرس غير موجود أو ليس لديك صلاحية" });

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الدرس" });
    }
}
