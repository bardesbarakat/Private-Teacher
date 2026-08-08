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
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CoursesController(AppDbContext db) => _db = db;

    // GET /api/courses  — public, all published
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? level)
    {
        var query = _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .Include(c => c.Lessons)
            .Where(c => c.IsPublished);

        if (!string.IsNullOrEmpty(level))
            query = query.Where(c => c.Level == level);

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level,
                ThumbnailUrl = c.ThumbnailUrl,
                IsPublished = c.IsPublished,
                CreatedAt = c.CreatedAt,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.FullNameAr,
                EnrollmentCount = c.Enrollments.Count,
                LessonCount = c.Lessons.Count
            })
            .ToListAsync();

        return Ok(courses);
    }

    // GET /api/courses/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var course = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "الكورس غير موجود" });

        return Ok(new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level,
            ThumbnailUrl = course.ThumbnailUrl,
            IsPublished = course.IsPublished,
            CreatedAt = course.CreatedAt,
            TeacherId = course.TeacherId,
            TeacherName = course.Teacher.FullNameAr,
            EnrollmentCount = course.Enrollments.Count,
            LessonCount = course.Lessons.Count
        });
    }

    // GET /api/courses/my — teacher's own courses
    [HttpGet("my")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetMyCourses()
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var courses = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .Include(c => c.Lessons)
            .Where(c => c.TeacherId == teacherId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CourseResponseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level,
                ThumbnailUrl = c.ThumbnailUrl,
                IsPublished = c.IsPublished,
                CreatedAt = c.CreatedAt,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.FullNameAr,
                EnrollmentCount = c.Enrollments.Count,
                LessonCount = c.Lessons.Count
            })
            .ToListAsync();

        return Ok(courses);
    }

    // POST /api/courses
    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "عنوان الكورس مطلوب" });

        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = new Course
        {
            Title = dto.Title.Trim(),
            Description = dto.Description,
            Level = dto.Level,
            ThumbnailUrl = dto.ThumbnailUrl,
            TeacherId = teacherId
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = course.Id },
            new { message = "تم إنشاء الكورس بنجاح", id = course.Id });
    }

    // PUT /api/courses/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCourseDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == id && c.TeacherId == teacherId);
        if (course == null) return NotFound(new { message = "الكورس غير موجود أو ليس لديك صلاحية" });

        course.Title = dto.Title.Trim();
        course.Description = dto.Description;
        course.Level = dto.Level;
        course.ThumbnailUrl = dto.ThumbnailUrl;
        course.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الكورس" });
    }

    // DELETE /api/courses/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == id && c.TeacherId == teacherId);
        if (course == null) return NotFound(new { message = "الكورس غير موجود أو ليس لديك صلاحية" });

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الكورس" });
    }

    // POST /api/courses/enroll
    [HttpPost("enroll")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Enroll([FromBody] EnrollRequestDto dto)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var alreadyEnrolled = await _db.Enrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == dto.CourseId);
        if (alreadyEnrolled) return BadRequest(new { message = "أنت مسجّل في هذا الكورس بالفعل" });

        var courseExists = await _db.Courses.AnyAsync(c => c.Id == dto.CourseId && c.IsPublished);
        if (!courseExists) return NotFound(new { message = "الكورس غير موجود" });

        _db.Enrollments.Add(new Enrollment { StudentId = studentId, CourseId = dto.CourseId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم التسجيل في الكورس بنجاح" });
    }

    // GET /api/courses/enrolled — student's enrolled courses
    [HttpGet("enrolled")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetEnrolled()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var enrollments = await _db.Enrollments
            .Include(e => e.Course).ThenInclude(c => c.Teacher)
            .Include(e => e.Course).ThenInclude(c => c.Lessons)
            .Where(e => e.StudentId == studentId)
            .Select(e => new EnrollmentResponseDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                EnrolledAt = e.EnrolledAt,
                Status = e.Status
            })
            .ToListAsync();

        return Ok(enrollments);
    }
}
