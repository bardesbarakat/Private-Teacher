using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Services;

public class CourseService(AppDbContext db)
{
    public async Task<List<CourseDto>> GetAllAsync(string? category = null)
    {
        var q = db.Courses
            .Include(c => c.Features)
            .Include(c => c.Lessons)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublished)
            .OrderBy(c => c.Order)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            q = q.Where(c => c.Category == category);

        var courses = await q.ToListAsync();
        return courses.Select(MapCourse).ToList();
    }

    public async Task<CourseDetailDto?> GetDetailAsync(int id, int? userId = null)
    {
        var course = await db.Courses
            .Include(c => c.Features)
            .Include(c => c.Lessons)
            .Include(c => c.Exams).ThenInclude(e => e.Questions)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id && c.IsPublished);

        if (course is null) return null;

        // Get completed lessons for current user
        HashSet<int> completedIds = [];
        bool isEnrolled = false;

        if (userId.HasValue)
        {
            completedIds = (await db.LessonProgresses
                .Where(lp => lp.UserId == userId && lp.IsCompleted)
                .Select(lp => lp.LessonId)
                .ToListAsync()).ToHashSet();

            isEnrolled = await db.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == id);
        }

        // Group lessons into chapters
        var chapters = course.Lessons
            .OrderBy(l => l.ChapterOrder).ThenBy(l => l.Order)
            .GroupBy(l => new { l.ChapterTitle, l.ChapterOrder })
            .Select(g => new ChapterDto(
                g.Key.ChapterTitle, g.Key.ChapterOrder,
                g.Select(l => new LessonSummaryDto(
                    l.Id, l.Title, l.DurationSeconds, l.Order,
                    completedIds.Contains(l.Id))).ToList()))
            .ToList();

        // Exam summaries
        List<ExamSummaryDto>? examSummaries = null;
        if (userId.HasValue)
        {
            var results = await db.ExamResults
                .Where(r => r.UserId == userId && course.Exams.Select(e => e.Id).Contains(r.ExamId))
                .ToListAsync();

            examSummaries = course.Exams.Select(e => new ExamSummaryDto(
                e.Id, e.Title, e.TimeLimitMinutes,
                e.Questions.Count, e.PassingScore,
                results.Any(r => r.ExamId == e.Id),
                results.Where(r => r.ExamId == e.Id).Select(r => (float?)r.Score).Max()
            )).ToList();
        }

        return new CourseDetailDto(
            course.Id, course.Title, course.ShortDescription,
            course.Description, course.Category, course.Level,
            course.ImageUrl, course.TelegramUrl,
            course.IsFree, course.Price,
            course.Features.OrderBy(f => f.Order).Select(f => f.Text).ToList(),
            chapters,
            examSummaries ?? [],
            course.Lessons.Sum(l => l.DurationSeconds),
            course.Enrollments.Count,
            isEnrolled);
    }

    private static CourseDto MapCourse(Course c) => new(
        c.Id, c.Title, c.ShortDescription, c.Description,
        c.Category, c.Level, c.ImageUrl, c.TelegramUrl,
        c.IsFree, c.Price, c.IsPublished,
        c.Lessons.Count, c.Enrollments.Count,
        c.Features.OrderBy(f => f.Order).Select(f => f.Text).ToList());
}

public class EnrollmentService(AppDbContext db)
{
    public async Task<(bool Success, string? Error)> EnrollAsync(int userId, int courseId)
    {
        if (await db.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId))
            return (false, "أنت مسجّل في هذا الكورس بالفعل");

        if (!await db.Courses.AnyAsync(c => c.Id == courseId && c.IsPublished))
            return (false, "الكورس غير موجود");

        db.Enrollments.Add(new Enrollment { UserId = userId, CourseId = courseId });
        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<List<EnrollmentDto>> GetUserEnrollmentsAsync(int userId)
    {
        return await db.Enrollments
            .Include(e => e.Course).ThenInclude(c => c.Lessons)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => new EnrollmentDto(
                e.Id, e.CourseId, e.Course.Title, e.Course.ImageUrl,
                e.Progress, e.CompletedLessons, e.Course.Lessons.Count,
                e.EnrolledAt))
            .ToListAsync();
    }
}

public class LessonService(AppDbContext db)
{
    public async Task<LessonDto?> GetLessonAsync(int lessonId, int userId)
    {
        var lesson = await db.Lessons
            .Include(l => l.Resources)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.IsPublished);
        if (lesson is null) return null;

        var progress = await db.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId);

        var note = await db.Notes
            .FirstOrDefaultAsync(n => n.LessonId == lessonId && n.UserId == userId);

        return new LessonDto(
            lesson.Id, lesson.CourseId, lesson.Title,
            lesson.Description, lesson.VideoUrl, lesson.TranscriptText,
            lesson.DurationSeconds, lesson.Order,
            lesson.ChapterTitle, lesson.ChapterOrder,
            lesson.Resources.Select(r => new ResourceDto(
                r.Id, r.Title, r.Url, r.Type, r.FileSizeBytes)).ToList(),
            note?.Content,
            progress?.IsCompleted ?? false);
    }

    public async Task CompleteAsync(int userId, int lessonId, int watchedSeconds)
    {
        var progress = await db.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.LessonId == lessonId);

        if (progress is null)
        {
            progress = new LessonProgress
            {
                UserId = userId, LessonId = lessonId,
                IsCompleted = true, WatchedSeconds = watchedSeconds,
                CompletedAt = DateTime.UtcNow
            };
            db.LessonProgresses.Add(progress);
        }
        else
        {
            progress.IsCompleted = true;
            progress.WatchedSeconds = Math.Max(progress.WatchedSeconds, watchedSeconds);
            progress.CompletedAt ??= DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        await UpdateEnrollmentProgressAsync(userId, lessonId);
    }

    private async Task UpdateEnrollmentProgressAsync(int userId, int lessonId)
    {
        var lesson = await db.Lessons.FindAsync(lessonId);
        if (lesson is null) return;

        var enrollment = await db.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId);
        if (enrollment is null) return;

        var totalLessons  = await db.Lessons.CountAsync(l => l.CourseId == lesson.CourseId);
        var completedCount = await db.LessonProgresses
            .CountAsync(lp => lp.UserId == userId && lp.IsCompleted &&
                               db.Lessons.Any(l => l.Id == lp.LessonId && l.CourseId == lesson.CourseId));

        enrollment.CompletedLessons = completedCount;
        enrollment.Progress = totalLessons > 0 ? (float)completedCount / totalLessons * 100 : 0;
        if (enrollment.Progress >= 100) enrollment.CompletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task SaveNoteAsync(int userId, int lessonId, string content)
    {
        var note = await db.Notes
            .FirstOrDefaultAsync(n => n.UserId == userId && n.LessonId == lessonId);
        if (note is null)
            db.Notes.Add(new Note { UserId = userId, LessonId = lessonId, Content = content });
        else
        {
            note.Content   = content;
            note.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
    }
}

public class ExamService(AppDbContext db)
{
    public async Task<ExamDetailDto?> GetExamAsync(int examId)
    {
        var exam = await db.Exams
            .Include(e => e.Questions)
            .FirstOrDefaultAsync(e => e.Id == examId && e.IsPublished);
        if (exam is null) return null;

        return new ExamDetailDto(
            exam.Id, exam.Title, exam.Description,
            exam.TimeLimitMinutes, exam.PassingScore,
            exam.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto(
                q.Id, q.Text, q.CodeBlock,
                q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.Order)).ToList());
    }

    public async Task<ExamResultDto> SubmitAsync(int userId, SubmitExamRequest req)
    {
        var exam = await db.Exams
            .Include(e => e.Questions)
            .FirstOrDefaultAsync(e => e.Id == req.ExamId)
            ?? throw new KeyNotFoundException("الامتحان غير موجود");

        int correct = 0;
        var reviewList = new List<AnswerReviewDto>();

        foreach (var q in exam.Questions)
        {
            req.Answers.TryGetValue(q.Id, out var selected);
            bool isCorrect = selected == q.CorrectOption;
            if (isCorrect) correct++;
            reviewList.Add(new AnswerReviewDto(
                q.Id, q.Text, q.CodeBlock,
                q.OptionA, q.OptionB, q.OptionC, q.OptionD,
                q.CorrectOption, selected ?? "", isCorrect, q.Explanation));
        }

        float score = exam.Questions.Count > 0
            ? (float)correct / exam.Questions.Count * 100 : 0;

        var result = new ExamResult
        {
            UserId = userId, ExamId = req.ExamId,
            Score = score, CorrectAnswers = correct,
            TotalQuestions = exam.Questions.Count,
            TimeTakenSeconds = req.TimeTakenSeconds,
            AnswersJson = System.Text.Json.JsonSerializer.Serialize(req.Answers),
            CompletedAt = DateTime.UtcNow
        };
        db.ExamResults.Add(result);
        await db.SaveChangesAsync();

        string grade = score switch
        {
            >= 90 => "ممتاز",
            >= 80 => "جيد جداً",
            >= 70 => "جيد",
            >= 60 => "مقبول",
            _     => "راسب"
        };

        return new ExamResultDto(
            result.Id, score, correct, exam.Questions.Count,
            req.TimeTakenSeconds, score >= exam.PassingScore,
            grade, result.CompletedAt, reviewList);
    }
}

public class DashboardService(AppDbContext db)
{
    public async Task<DashboardDto> GetDashboardAsync(int userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("المستخدم غير موجود");

        var enrollments = await db.Enrollments
            .Include(e => e.Course).ThenInclude(c => c.Lessons)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .Take(5)
            .Select(e => new EnrollmentDto(
                e.Id, e.CourseId, e.Course.Title, e.Course.ImageUrl,
                e.Progress, e.CompletedLessons, e.Course.Lessons.Count,
                e.EnrolledAt))
            .ToListAsync();

        var results = await db.ExamResults
            .Where(r => r.UserId == userId)
            .ToListAsync();

        var totalEnrolled   = await db.Enrollments.CountAsync(e => e.UserId == userId);
        var totalCompleted  = await db.Enrollments.CountAsync(e => e.UserId == userId && e.CompletedAt != null);
        var avgScore = results.Count > 0 ? results.Average(r => r.Score) : 0;
        var totalHours = await db.LessonProgresses
            .Where(lp => lp.UserId == userId)
            .SumAsync(lp => (long)lp.WatchedSeconds) / 3600.0f;

        // Upcoming exams (from enrolled courses, not yet attempted)
        var enrolledCourseIds = await db.Enrollments
            .Where(e => e.UserId == userId)
            .Select(e => e.CourseId).ToListAsync();

        var attemptedExamIds = results.Select(r => r.ExamId).ToHashSet();

        var upcomingExams = await db.Exams
            .Include(e => e.Questions)
            .Where(e => enrolledCourseIds.Contains(e.CourseId) && e.IsPublished)
            .Take(5)
            .Select(e => new ExamSummaryDto(
                e.Id, e.Title, e.TimeLimitMinutes,
                e.Questions.Count, e.PassingScore,
                attemptedExamIds.Contains(e.Id),
                results.Where(r => r.ExamId == e.Id).Select(r => (float?)r.Score).Max()))
            .ToListAsync();

        // Recent activity
        var activity = new List<ActivityDto>();
        foreach (var e in enrollments.Take(3))
            activity.Add(new("enrollment", $"سجّلت في كورس {e.CourseTitle}", e.EnrolledAt, "📚"));
        foreach (var r in results.Take(2))
            activity.Add(new("exam", $"أنهيت اختبار بدرجة {r.Score:F0}%", r.CompletedAt, "📝"));
        activity = [.. activity.OrderByDescending(a => a.Timestamp)];

        return new DashboardDto(
            AuthService.MapUser(user),
            totalEnrolled, totalCompleted,
            (float)Math.Round(avgScore, 1),
            (int)Math.Round(totalHours),
            enrollments, upcomingExams, activity);
    }
}
