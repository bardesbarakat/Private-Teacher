using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BEdu.API.Models;

public class Exam
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int DurationMinutes { get; set; } = 30;

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? CourseId { get; set; }
    [ForeignKey(nameof(CourseId))]
    public Course? Course { get; set; }

    public int? LessonId { get; set; }
    [ForeignKey(nameof(LessonId))]
    public Lesson? Lesson { get; set; }

    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<ExamSubmission> Submissions { get; set; } = new List<ExamSubmission>();
}

public class Question
{
    public int Id { get; set; }

    [Required, MaxLength(2000)]
    public string TextAr { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string TextEn { get; set; } = string.Empty;

    public int Score { get; set; } = 1;

    public int Order { get; set; } = 0;

    public int ExamId { get; set; }
    [ForeignKey(nameof(ExamId))]
    public Exam Exam { get; set; } = null!;

    public ICollection<AnswerOption> Options { get; set; } = new List<AnswerOption>();
}

public class AnswerOption
{
    public int Id { get; set; }

    [Required, MaxLength(1000)]
    public string TextAr { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string TextEn { get; set; } = string.Empty;

    public bool IsCorrect { get; set; } = false;

    public int QuestionId { get; set; }
    [ForeignKey(nameof(QuestionId))]
    public Question Question { get; set; } = null!;
}

public class ExamSubmission
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    [ForeignKey(nameof(StudentId))]
    public User Student { get; set; } = null!;

    public int ExamId { get; set; }
    [ForeignKey(nameof(ExamId))]
    public Exam Exam { get; set; } = null!;

    public int Score { get; set; }
    public int MaxScore { get; set; }
    public double Percentage { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StudentAnswer> Answers { get; set; } = new List<StudentAnswer>();
}

public class StudentAnswer
{
    public int Id { get; set; }

    public int SubmissionId { get; set; }
    [ForeignKey(nameof(SubmissionId))]
    public ExamSubmission Submission { get; set; } = null!;

    public int QuestionId { get; set; }
    [ForeignKey(nameof(QuestionId))]
    public Question Question { get; set; } = null!;

    public int? SelectedOptionId { get; set; }
    [ForeignKey(nameof(SelectedOptionId))]
    public AnswerOption? SelectedOption { get; set; }

    public bool IsCorrect { get; set; }
}
