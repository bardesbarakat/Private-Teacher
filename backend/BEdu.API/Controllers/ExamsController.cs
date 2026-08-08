using System.Security.Claims;
using BEdu.API.Data;
using BEdu.API.DTOs.Exams;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ExamsController(AppDbContext db) => _db = db;

    // GET /api/exams/course/{courseId} — list exams for a course
    [HttpGet("course/{courseId}")]
    [Authorize]
    public async Task<IActionResult> GetByCourse(int courseId)
    {
        var exams = await _db.Exams
            .Include(e => e.Questions)
            .Include(e => e.Course)
            .Where(e => e.CourseId == courseId && e.IsPublished)
            .Select(e => new ExamResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                DurationMinutes = e.DurationMinutes,
                CourseId = e.CourseId,
                CourseTitle = e.Course != null ? e.Course.Title : null,
                LessonId = e.LessonId,
                IsPublished = e.IsPublished,
                CreatedAt = e.CreatedAt,
                QuestionCount = e.Questions.Count,
                TotalScore = e.Questions.Sum(q => q.Score)
            })
            .ToListAsync();

        return Ok(exams);
    }

    // GET /api/exams/{id}/take — get exam for taking (no correct answers)
    [HttpGet("{id}/take")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> TakeExam(int id)
    {
        var exam = await _db.Exams
            .Include(e => e.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == id && e.IsPublished);

        if (exam == null) return NotFound(new { message = "الاختبار غير موجود" });

        // Check if already submitted
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var alreadySubmitted = await _db.ExamSubmissions.AnyAsync(s => s.StudentId == studentId && s.ExamId == id);
        if (alreadySubmitted)
            return BadRequest(new { message = "لقد أجريت هذا الاختبار بالفعل", alreadySubmitted = true });

        return Ok(new ExamDetailDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            CourseId = exam.CourseId,
            Questions = exam.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Score = q.Score,
                Order = q.Order,
                Options = q.Options.Select(o => new AnswerOptionDto
                {
                    Id = o.Id,
                    Text = o.Text
                    // IsCorrect intentionally hidden
                }).ToList()
            }).ToList()
        });
    }

    // POST /api/exams/submit — student submits exam
    [HttpPost("submit")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Submit([FromBody] SubmitExamDto dto)
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Prevent double submission
        var alreadySubmitted = await _db.ExamSubmissions.AnyAsync(s => s.StudentId == studentId && s.ExamId == dto.ExamId);
        if (alreadySubmitted) return BadRequest(new { message = "لقد أجريت هذا الاختبار بالفعل" });

        var exam = await _db.Exams
            .Include(e => e.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(e => e.Id == dto.ExamId);
        if (exam == null) return NotFound(new { message = "الاختبار غير موجود" });

        // Grade
        int totalScore = 0, maxScore = 0;
        var studentAnswers = new List<StudentAnswer>();

        foreach (var question in exam.Questions)
        {
            maxScore += question.Score;
            var submitted = dto.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var selectedOptionId = submitted?.SelectedOptionId;
            var selectedOption = question.Options.FirstOrDefault(o => o.Id == selectedOptionId);
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
            var isCorrect = selectedOption != null && selectedOption.IsCorrect;

            if (isCorrect) totalScore += question.Score;

            studentAnswers.Add(new StudentAnswer
            {
                QuestionId = question.Id,
                SelectedOptionId = selectedOptionId,
                IsCorrect = isCorrect
            });
        }

        var percentage = maxScore > 0 ? (double)totalScore / maxScore * 100 : 0;

        var submission = new ExamSubmission
        {
            StudentId = studentId,
            ExamId = dto.ExamId,
            Score = totalScore,
            MaxScore = maxScore,
            Percentage = Math.Round(percentage, 2),
            Answers = studentAnswers
        };

        _db.ExamSubmissions.Add(submission);
        await _db.SaveChangesAsync();

        // Return full result
        return Ok(await BuildResultDto(submission.Id));
    }

    // GET /api/exams/results/{submissionId}
    [HttpGet("results/{submissionId}")]
    [Authorize]
    public async Task<IActionResult> GetResult(int submissionId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role);

        var submission = await _db.ExamSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId);
        if (submission == null) return NotFound();

        // Students can only see their own; Teachers/Parents see all
        if (role == "Student" && submission.StudentId != userId)
            return Forbid();

        return Ok(await BuildResultDto(submissionId));
    }

    // GET /api/exams/my-results — student's all results
    [HttpGet("my-results")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyResults()
    {
        var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var results = await _db.ExamSubmissions
            .Include(s => s.Exam)
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new
            {
                s.Id,
                s.ExamId,
                ExamTitle = s.Exam.Title,
                s.Score,
                s.MaxScore,
                s.Percentage,
                s.SubmittedAt
            })
            .ToListAsync();
        return Ok(results);
    }

    // GET /api/exams/student/{studentId}/results — parent views child results
    [HttpGet("student/{studentId}/results")]
    [Authorize(Roles = "Parent,Teacher")]
    public async Task<IActionResult> GetStudentResults(int studentId)
    {
        var results = await _db.ExamSubmissions
            .Include(s => s.Exam)
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new
            {
                s.Id,
                s.ExamId,
                ExamTitle = s.Exam.Title,
                s.Score,
                s.MaxScore,
                s.Percentage,
                s.SubmittedAt
            })
            .ToListAsync();
        return Ok(results);
    }

    // POST /api/exams — Teacher creates exam
    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> Create([FromBody] CreateExamDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "عنوان الاختبار مطلوب" });
        if (dto.Questions == null || dto.Questions.Count == 0)
            return BadRequest(new { message = "يجب إضافة سؤال واحد على الأقل" });

        var exam = new Exam
        {
            Title = dto.Title.Trim(),
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            CourseId = dto.CourseId,
            LessonId = dto.LessonId,
            Questions = dto.Questions.Select((q, qi) => new Question
            {
                Text = q.Text,
                Score = q.Score,
                Order = q.Order > 0 ? q.Order : qi + 1,
                Options = q.Options.Select(o => new AnswerOption
                {
                    Text = o.Text,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(TakeExam), new { id = exam.Id },
            new { message = "تم إنشاء الاختبار بنجاح", id = exam.Id });
    }

    private async Task<ExamResultDto> BuildResultDto(int submissionId)
    {
        var submission = await _db.ExamSubmissions
            .Include(s => s.Exam)
            .Include(s => s.Answers).ThenInclude(a => a.Question).ThenInclude(q => q.Options)
            .Include(s => s.Answers).ThenInclude(a => a.SelectedOption)
            .FirstAsync(s => s.Id == submissionId);

        return new ExamResultDto
        {
            SubmissionId = submission.Id,
            ExamId = submission.ExamId,
            ExamTitle = submission.Exam.Title,
            Score = submission.Score,
            MaxScore = submission.MaxScore,
            Percentage = submission.Percentage,
            SubmittedAt = submission.SubmittedAt,
            Answers = submission.Answers.Select(a =>
            {
                var correct = a.Question.Options.FirstOrDefault(o => o.IsCorrect);
                return new AnswerResultDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.Text,
                    Score = a.Question.Score,
                    SelectedOptionId = a.SelectedOptionId,
                    SelectedOptionText = a.SelectedOption?.Text,
                    CorrectOptionId = correct?.Id ?? 0,
                    CorrectOptionText = correct?.Text ?? "",
                    IsCorrect = a.IsCorrect
                };
            }).ToList()
        };
    }
}
