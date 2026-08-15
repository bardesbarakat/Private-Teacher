namespace BEdu.API.DTOs.Exams;

// --- Exam DTOs ---
public class CreateExamDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public int? CourseId { get; set; }
    public int? LessonId { get; set; }
    public List<CreateQuestionDto> Questions { get; set; } = new();
}

public class CreateQuestionDto
{
    public string TextAr { get; set; } = string.Empty;
    public string TextEn { get; set; } = string.Empty;
    public int Score { get; set; } = 1;
    public int Order { get; set; }
    public List<CreateAnswerOptionDto> Options { get; set; } = new();
}

public class CreateAnswerOptionDto
{
    public string TextAr { get; set; } = string.Empty;
    public string TextEn { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class ExamResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int? CourseId { get; set; }
    public string? CourseTitle { get; set; }
    public int? LessonId { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public int QuestionCount { get; set; }
    public int TotalScore { get; set; }
}

public class ExamDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int? CourseId { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public int Id { get; set; }
    public string TextAr { get; set; } = string.Empty;
    public string TextEn { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Order { get; set; }
    public List<AnswerOptionDto> Options { get; set; } = new();
}

public class AnswerOptionDto
{
    public int Id { get; set; }
    public string TextAr { get; set; } = string.Empty;
    public string TextEn { get; set; } = string.Empty;
    // IsCorrect is hidden from students at exam time, shown in results
}

// --- Submission DTOs ---
public class SubmitExamDto
{
    public int ExamId { get; set; }
    public List<StudentAnswerDto> Answers { get; set; } = new();
}

public class StudentAnswerDto
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
}

public class ExamResultDto
{
    public int SubmissionId { get; set; }
    public int ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public double Percentage { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<AnswerResultDto> Answers { get; set; } = new();
}

public class AnswerResultDto
{
    public int QuestionId { get; set; }
    public string QuestionTextAr { get; set; } = string.Empty;
    public string QuestionTextEn { get; set; } = string.Empty;
    public int Score { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? SelectedOptionTextAr { get; set; }
    public string? SelectedOptionTextEn { get; set; }
    public int CorrectOptionId { get; set; }
    public string CorrectOptionTextAr { get; set; } = string.Empty;
    public string CorrectOptionTextEn { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
