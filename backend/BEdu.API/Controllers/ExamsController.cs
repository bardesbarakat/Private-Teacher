using BEdu.API.Data;
using BEdu.API.DTOs.Exams;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExamsController(AppDbContext context)
    {
        _context = context;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ==========================================
    // INSTRUCTOR ENDPOINTS (ApprovedTeacher Only)
    // ==========================================

    [HttpPost]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<ActionResult<ExamResponseDto>> CreateExam([FromBody] CreateExamDto dto)
    {
        // Must specify either CourseId or LessonId
        if (dto.CourseId == null && dto.LessonId == null)
            return BadRequest(new { message = "يجب ربط الاختبار بكورس أو درس." });

        Course? course = null;
        if (dto.CourseId.HasValue)
        {
            course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId.Value && c.TeacherId == UserId);
            if (course == null) return Forbid();
        }

        if (dto.LessonId.HasValue)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Chapter).ThenInclude(c => c.Track).ThenInclude(t => t.Course)
                .FirstOrDefaultAsync(l => l.Id == dto.LessonId.Value);

            if (lesson == null || lesson.Chapter.Track.Course.TeacherId != UserId) return Forbid();
            course = lesson.Chapter.Track.Course;
        }

        var exam = new Exam
        {
            Title = dto.Title,
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            CourseId = dto.CourseId,
            LessonId = dto.LessonId,
            IsPublished = false,
            Questions = dto.Questions.Select(q => new Question
            {
                TextAr = q.TextAr,
                TextEn = q.TextEn,
                Score = q.Score,
                Order = q.Order,
                Options = q.Options.Select(o => new AnswerOption
                {
                    TextAr = o.TextAr,
                    TextEn = o.TextEn,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExamDetail), new { id = exam.Id }, ToResponseDto(exam, course?.Title));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> UpdateExam(int id, [FromBody] CreateExamDto dto)
    {
        var exam = await _context.Exams
            .Include(e => e.Course)
            .Include(e => e.Lesson).ThenInclude(l => l.Chapter).ThenInclude(c => c.Track).ThenInclude(t => t.Course)
            .Include(e => e.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null) return NotFound();

        var teacherId = exam.CourseId.HasValue ? exam.Course.TeacherId : exam.Lesson.Chapter.Track.Course.TeacherId;
        if (teacherId != UserId) return Forbid();

        exam.Title = dto.Title;
        exam.Description = dto.Description;
        exam.DurationMinutes = dto.DurationMinutes;
        exam.CourseId = dto.CourseId;
        exam.LessonId = dto.LessonId;

        // Simplify by removing old questions and adding new ones
        _context.Questions.RemoveRange(exam.Questions);
        
        exam.Questions = dto.Questions.Select(q => new Question
        {
            TextAr = q.TextAr,
            TextEn = q.TextEn,
            Score = q.Score,
            Order = q.Order,
            Options = q.Options.Select(o => new AnswerOption
            {
                TextAr = o.TextAr,
                TextEn = o.TextEn,
                IsCorrect = o.IsCorrect
            }).ToList()
        }).ToList();

        await _context.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الاختبار بنجاح" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteExam(int id)
    {
        var exam = await _context.Exams
            .Include(e => e.Course)
            .Include(e => e.Lesson).ThenInclude(l => l.Chapter).ThenInclude(c => c.Track).ThenInclude(t => t.Course)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null) return NotFound();

        var teacherId = exam.CourseId.HasValue ? exam.Course.TeacherId : exam.Lesson.Chapter.Track.Course.TeacherId;
        if (teacherId != UserId) return Forbid();

        _context.Exams.Remove(exam);
        await _context.SaveChangesAsync();
        return Ok(new { message = "تم حذف الاختبار بنجاح" });
    }

    // ==========================================
    // STUDENT ENDPOINTS
    // ==========================================

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IEnumerable<ExamResponseDto>>> GetCourseExams(int courseId)
    {
        var isTeacher = User.IsInRole("Teacher");
        var exams = await _context.Exams
            .Include(e => e.Course)
            .Include(e => e.Lesson).ThenInclude(l => l.Chapter).ThenInclude(c => c.Track)
            .Include(e => e.Questions)
            .Where(e => e.CourseId == courseId || e.Lesson.Chapter.Track.CourseId == courseId)
            .Where(e => isTeacher || e.IsPublished)
            .ToListAsync();

        return exams.Select(e => ToResponseDto(e, e.Course?.Title)).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExamDetailDto>> GetExamDetail(int id)
    {
        var exam = await _context.Exams
            .Include(e => e.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null) return NotFound();

        var isStudent = User.IsInRole("Student");
        if (isStudent && !exam.IsPublished) return Forbid();

        var detail = new ExamDetailDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            CourseId = exam.CourseId,
            Questions = exam.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                TextAr = q.TextAr,
                TextEn = q.TextEn,
                Score = q.Score,
                Order = q.Order,
                Options = q.Options.Select(o => new AnswerOptionDto
                {
                    Id = o.Id,
                    TextAr = o.TextAr,
                    TextEn = o.TextEn,
                    // If student, don't expose IsCorrect! Only for instructors
                    // Wait, we didn't add IsCorrect to AnswerOptionDto intentionally.
                }).ToList()
            }).ToList()
        };

        return detail;
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<ExamResultDto>> SubmitExam(int id, [FromBody] SubmitExamDto dto)
    {
        var exam = await _context.Exams
            .Include(e => e.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null || !exam.IsPublished) return NotFound();

        var existingSub = await _context.ExamSubmissions
            .FirstOrDefaultAsync(s => s.ExamId == id && s.StudentId == UserId);

        if (existingSub != null)
            return BadRequest(new { message = "لقد قمت بتسليم هذا الاختبار مسبقاً", alreadySubmitted = true });

        var submission = new ExamSubmission
        {
            ExamId = id,
            StudentId = UserId,
            SubmittedAt = DateTime.UtcNow
        };

        int totalScore = 0;
        int maxScore = exam.Questions.Sum(q => q.Score);

        var resultDto = new ExamResultDto
        {
            ExamId = exam.Id,
            ExamTitle = exam.Title,
            MaxScore = maxScore,
            SubmittedAt = submission.SubmittedAt
        };

        foreach (var q in exam.Questions)
        {
            var studentAns = dto.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var correctOpt = q.Options.First(o => o.IsCorrect);
            
            bool isCorrect = studentAns?.SelectedOptionId == correctOpt.Id;
            if (isCorrect) totalScore += q.Score;

            submission.Answers.Add(new StudentAnswer
            {
                QuestionId = q.Id,
                SelectedOptionId = studentAns?.SelectedOptionId
            });

            var selectedOpt = q.Options.FirstOrDefault(o => o.Id == studentAns?.SelectedOptionId);

            resultDto.Answers.Add(new AnswerResultDto
            {
                QuestionId = q.Id,
                QuestionTextAr = q.TextAr,
                QuestionTextEn = q.TextEn,
                Score = q.Score,
                SelectedOptionId = studentAns?.SelectedOptionId,
                SelectedOptionTextAr = selectedOpt?.TextAr,
                SelectedOptionTextEn = selectedOpt?.TextEn,
                CorrectOptionId = correctOpt.Id,
                CorrectOptionTextAr = correctOpt.TextAr,
                CorrectOptionTextEn = correctOpt.TextEn,
                IsCorrect = isCorrect
            });
        }

        submission.Score = totalScore;
        submission.Percentage = maxScore > 0 ? ((double)totalScore / maxScore) * 100 : 0;

        resultDto.Score = totalScore;
        resultDto.Percentage = submission.Percentage;

        _context.ExamSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        resultDto.SubmissionId = submission.Id;

        return Ok(resultDto);
    }

    [HttpGet("results/me")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<IEnumerable<ExamResultDto>>> GetMyResults()
    {
        var subs = await _context.ExamSubmissions
            .Include(s => s.Exam)
            .Where(s => s.StudentId == UserId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync();

        return subs.Select(s => new ExamResultDto
        {
            SubmissionId = s.Id,
            ExamId = s.ExamId,
            ExamTitle = s.Exam.Title,
            Score = s.Score,
            MaxScore = s.Exam.Questions?.Sum(q => q.Score) ?? 0, // This is slow, but we can store MaxScore in DB later if needed. For now it's fine or we calculate it.
            Percentage = s.Percentage,
            SubmittedAt = s.SubmittedAt
        }).ToList();
    }
    
    [HttpGet("results/{submissionId}")]
    public async Task<ActionResult<ExamResultDto>> GetResult(int submissionId)
    {
        var sub = await _context.ExamSubmissions
            .Include(s => s.Exam).ThenInclude(e => e.Questions).ThenInclude(q => q.Options)
            .Include(s => s.Answers).ThenInclude(a => a.SelectedOption)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (sub == null) return NotFound();
        if (User.IsInRole("Student") && sub.StudentId != UserId) return Forbid();

        var resultDto = new ExamResultDto
        {
            SubmissionId = sub.Id,
            ExamId = sub.ExamId,
            ExamTitle = sub.Exam.Title,
            Score = sub.Score,
            Percentage = sub.Percentage,
            SubmittedAt = sub.SubmittedAt,
            MaxScore = sub.Exam.Questions.Sum(q => q.Score)
        };

        foreach (var q in sub.Exam.Questions)
        {
            var ans = sub.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var correctOpt = q.Options.First(o => o.IsCorrect);
            resultDto.Answers.Add(new AnswerResultDto
            {
                QuestionId = q.Id,
                QuestionTextAr = q.TextAr,
                QuestionTextEn = q.TextEn,
                Score = q.Score,
                SelectedOptionId = ans?.SelectedOptionId,
                SelectedOptionTextAr = ans?.SelectedOption?.TextAr,
                SelectedOptionTextEn = ans?.SelectedOption?.TextEn,
                CorrectOptionId = correctOpt.Id,
                CorrectOptionTextAr = correctOpt.TextAr,
                CorrectOptionTextEn = correctOpt.TextEn,
                IsCorrect = ans?.SelectedOptionId == correctOpt.Id
            });
        }
        return Ok(resultDto);
    }

    private ExamResponseDto ToResponseDto(Exam exam, string? courseTitle)
    {
        return new ExamResponseDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            CourseId = exam.CourseId,
            CourseTitle = courseTitle,
            LessonId = exam.LessonId,
            IsPublished = exam.IsPublished,
            CreatedAt = exam.CreatedAt,
            QuestionCount = exam.Questions?.Count ?? 0,
            TotalScore = exam.Questions?.Sum(q => q.Score) ?? 0
        };
    }
}
