namespace EduPlatform.API.DTOs;

// ── Auth ─────────────────────────────────────────────────────────────────────
public record RegisterRequest(
    string FirstName, string LastName,
    string Email, string Password,
    string? Phone, string Grade, string? City);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token, string TokenType,
    int ExpiresIn, UserDto User);

// ── User ─────────────────────────────────────────────────────────────────────
public record UserDto(
    int Id, string FirstName, string LastName,
    string Email, string? Phone, string Grade,
    string Role, string? City, string? AvatarUrl,
    DateTime CreatedAt);

public record UpdateProfileRequest(
    string FirstName, string LastName,
    string? Phone, string? City);

public record ChangePasswordRequest(
    string CurrentPassword, string NewPassword);

// ── Course ───────────────────────────────────────────────────────────────────
public record CourseDto(
    int Id, string Title, string ShortDescription,
    string Description, string Category, string Level,
    string? ImageUrl, string? TelegramUrl,
    bool IsFree, decimal Price, bool IsPublished,
    int LessonsCount, int EnrollmentsCount,
    List<string> Features);

public record CourseDetailDto(
    int Id, string Title, string ShortDescription,
    string Description, string Category, string Level,
    string? ImageUrl, string? TelegramUrl,
    bool IsFree, decimal Price,
    List<string> Features,
    List<ChapterDto> Chapters,
    List<ExamSummaryDto> Exams,
    int TotalDurationSeconds,
    int EnrollmentsCount,
    bool IsEnrolled);

public record ChapterDto(
    string Title, int Order,
    List<LessonSummaryDto> Lessons);

public record LessonSummaryDto(
    int Id, string Title, int DurationSeconds,
    int Order, bool IsCompleted);

// ── Lesson ───────────────────────────────────────────────────────────────────
public record LessonDto(
    int Id, int CourseId, string Title,
    string? Description, string? VideoUrl,
    string? TranscriptText, int DurationSeconds,
    int Order, string ChapterTitle, int ChapterOrder,
    List<ResourceDto> Resources,
    string? UserNote, bool IsCompleted);

public record ResourceDto(
    int Id, string Title, string Url,
    string Type, long FileSizeBytes);

public record SaveNoteRequest(int LessonId, string Content);
public record CompleteLessonRequest(int LessonId, int WatchedSeconds);

// ── Enrollment ───────────────────────────────────────────────────────────────
public record EnrollmentDto(
    int Id, int CourseId, string CourseTitle,
    string? CourseImageUrl, float Progress,
    int CompletedLessons, int TotalLessons,
    DateTime EnrolledAt);

public record EnrollRequest(int CourseId);

// ── Exam ─────────────────────────────────────────────────────────────────────
public record ExamSummaryDto(
    int Id, string Title, int TimeLimitMinutes,
    int QuestionsCount, int PassingScore,
    bool HasAttempted, float? BestScore);

public record ExamDetailDto(
    int Id, string Title, string? Description,
    int TimeLimitMinutes, int PassingScore,
    List<QuestionDto> Questions);

public record QuestionDto(
    int Id, string Text, string? CodeBlock,
    string OptionA, string OptionB,
    string OptionC, string OptionD, int Order);

public record SubmitExamRequest(
    int ExamId, int TimeTakenSeconds,
    Dictionary<int, string> Answers); // {questionId: selectedOption}

public record ExamResultDto(
    int Id, float Score, int CorrectAnswers,
    int TotalQuestions, int TimeTakenSeconds,
    bool Passed, string Grade,
    DateTime CompletedAt,
    List<AnswerReviewDto> Answers);

public record AnswerReviewDto(
    int QuestionId, string QuestionText,
    string? CodeBlock,
    string OptionA, string OptionB,
    string OptionC, string OptionD,
    string CorrectOption, string SelectedOption,
    bool IsCorrect, string? Explanation);

// ── Dashboard ────────────────────────────────────────────────────────────────
public record DashboardDto(
    UserDto User,
    int EnrolledCourses, int CompletedCourses,
    float AverageScore, int TotalStudyHours,
    List<EnrollmentDto> RecentEnrollments,
    List<ExamSummaryDto> UpcomingExams,
    List<ActivityDto> RecentActivity);

public record ActivityDto(
    string Type, string Description,
    DateTime Timestamp, string? Icon);
