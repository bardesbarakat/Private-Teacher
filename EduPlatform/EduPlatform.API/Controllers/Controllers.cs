using System.Security.Claims;
using EduPlatform.API.DTOs;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduPlatform.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var (ok, error, resp) = await auth.RegisterAsync(req);
        return ok ? Ok(resp) : BadRequest(new { message = error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var (ok, error, resp) = await auth.LoginAsync(req);
        return ok ? Ok(resp) : Unauthorized(new { message = error });
    }
}

[ApiController, Authorize]
[Route("api/[controller]")]
public class CoursesController(CourseService courses, EnrollmentService enrollments) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
        => Ok(await courses.GetAllAsync(category));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDetail(int id)
    {
        int? uid = User.Identity?.IsAuthenticated == true ? UserId : null;
        var result = await courses.GetDetailAsync(id, uid);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/enroll")]
    public async Task<IActionResult> Enroll(int id)
    {
        var (ok, error) = await enrollments.EnrollAsync(UserId, id);
        return ok ? Ok(new { message = "تم التسجيل في الكورس بنجاح" }) : BadRequest(new { message = error });
    }
}

[ApiController, Authorize]
[Route("api/[controller]")]
public class LessonsController(LessonService lessons) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var lesson = await lessons.GetLessonAsync(id, UserId);
        return lesson is null ? NotFound() : Ok(lesson);
    }

    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id, [FromBody] CompleteLessonRequest req)
    {
        await lessons.CompleteAsync(UserId, id, req.WatchedSeconds);
        return Ok(new { message = "تم إكمال الدرس" });
    }

    [HttpPost("notes")]
    public async Task<IActionResult> SaveNote([FromBody] SaveNoteRequest req)
    {
        await lessons.SaveNoteAsync(UserId, req.LessonId, req.Content);
        return Ok(new { message = "تم حفظ الملاحظة" });
    }
}

[ApiController, Authorize]
[Route("api/[controller]")]
public class ExamsController(ExamService exams) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var exam = await exams.GetExamAsync(id);
        return exam is null ? NotFound() : Ok(exam);
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmitExamRequest req)
    {
        var result = await exams.SubmitAsync(UserId, req);
        return Ok(result);
    }
}

[ApiController, Authorize]
[Route("api/[controller]")]
public class StudentsController(DashboardService dashboard, EnrollmentService enrollments) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
        => Ok(await dashboard.GetDashboardAsync(UserId));

    [HttpGet("enrollments")]
    public async Task<IActionResult> GetEnrollments()
        => Ok(await enrollments.GetUserEnrollmentsAsync(UserId));
}
