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
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminController(AppDbContext db) => _db = db;

    // ─── GET /api/admin/stats ───────────────────────────────────
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers      = await _db.Users.CountAsync();
        var totalStudents   = await _db.Users.CountAsync(u => u.Role == "Student");
        var totalTeachers   = await _db.Users.CountAsync(u => u.Role == "Teacher");
        var totalParents    = await _db.Users.CountAsync(u => u.Role == "Parent");
        var totalCourses    = await _db.Courses.CountAsync();
        var totalLessons    = await _db.Lessons.CountAsync();
        var totalExams      = await _db.Exams.CountAsync();
        var totalSubmissions= await _db.ExamSubmissions.CountAsync();
        var totalEnrollments= await _db.Enrollments.CountAsync();
        var avgScore        = await _db.ExamSubmissions.AnyAsync()
            ? await _db.ExamSubmissions.AverageAsync(s => s.Percentage) : 0;

        // New users this month
        var thisMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var newUsersThisMonth = await _db.Users.CountAsync(u => u.CreatedAt >= thisMonth);

        return Ok(new
        {
            totalUsers, totalStudents, totalTeachers, totalParents,
            totalCourses, totalLessons, totalExams,
            totalSubmissions, totalEnrollments,
            avgScore = Math.Round(avgScore, 1),
            newUsersThisMonth
        });
    }

    // ─── GET /api/admin/users ───────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role, [FromQuery] string? search)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(u =>
                u.FullNameAr.Contains(search) ||
                u.FullNameEn.Contains(search) ||
                u.Email.Contains(search) ||
                u.Username.Contains(search));

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id, u.FullNameAr, u.FullNameEn, u.Username,
                u.Email, u.PhoneNumber, u.Role, u.Governorate,
                u.AcademicYear, u.CreatedAt, u.IsActive
            })
            .ToListAsync();

        return Ok(users);
    }

    // ─── PUT /api/admin/users/{id}/toggle ──────────────────────
    [HttpPut("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new { message = user.IsActive ? "تم تفعيل المستخدم" : "تم إيقاف المستخدم", isActive = user.IsActive });
    }

    // ─── DELETE /api/admin/users/{id} ──────────────────────────
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف المستخدم" });
    }

    // ─── GET /api/admin/courses ─────────────────────────────────
    [HttpGet("courses")]
    public async Task<IActionResult> GetAllCourses()
    {
        var courses = await _db.Courses
            .Include(c => c.Teacher)
            .Include(c => c.Enrollments)
            .Include(c => c.Lessons)
            .Include(c => c.Exams)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Title, c.Description, c.Level,
                c.IsPublished, c.CreatedAt,
                TeacherName = c.Teacher.FullNameAr,
                EnrollmentCount = c.Enrollments.Count,
                LessonCount = c.Lessons.Count,
                ExamCount = c.Exams.Count
            })
            .ToListAsync();

        return Ok(courses);
    }

    // ─── PUT /api/admin/courses/{id}/toggle ────────────────────
    [HttpPut("courses/{id}/toggle")]
    public async Task<IActionResult> ToggleCourse(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "الكورس غير موجود" });

        course.IsPublished = !course.IsPublished;
        await _db.SaveChangesAsync();
        return Ok(new { message = course.IsPublished ? "تم نشر الكورس" : "تم إخفاء الكورس", isPublished = course.IsPublished });
    }

    // ─── DELETE /api/admin/courses/{id} ────────────────────────
    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "الكورس غير موجود" });

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الكورس" });
    }

    // ─── GET /api/admin/submissions ────────────────────────────
    [HttpGet("submissions")]
    public async Task<IActionResult> GetSubmissions()
    {
        var subs = await _db.ExamSubmissions
            .Include(s => s.Student)
            .Include(s => s.Exam)
            .OrderByDescending(s => s.SubmittedAt)
            .Take(200)
            .Select(s => new
            {
                s.Id,
                StudentName = s.Student.FullNameAr,
                StudentId = s.StudentId,
                ExamTitle = s.Exam.Title,
                s.Score, s.MaxScore, s.Percentage, s.SubmittedAt
            })
            .ToListAsync();

        return Ok(subs);
    }

    // ─── POST /api/admin/make-admin/{id} ───────────────────────
    [HttpPost("make-admin/{id}")]
    public async Task<IActionResult> MakeAdmin(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "المستخدم غير موجود" });

        user.Role = "Admin";
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم منح صلاحيات الأدمن" });
    }
}
