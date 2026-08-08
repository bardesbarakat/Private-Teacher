using BEdu.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();
    public DbSet<ExamSubmission> ExamSubmissions => Set<ExamSubmission>();
    public DbSet<StudentAnswer> StudentAnswers => Set<StudentAnswer>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Unique constraints
        builder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();
        builder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();

        // Enrollment composite unique (student + course)
        builder.Entity<Enrollment>()
            .HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();

        // Prevent cascade cycles on Course -> Teacher (restrict)
        builder.Entity<Course>()
            .HasOne(c => c.Teacher)
            .WithMany(u => u.Courses)
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);

        // Enrollment cascades
        builder.Entity<Enrollment>()
            .HasOne(e => e.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Enrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // ExamSubmission
        builder.Entity<ExamSubmission>()
            .HasOne(s => s.Student)
            .WithMany(u => u.ExamSubmissions)
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ExamSubmission>()
            .HasOne(s => s.Exam)
            .WithMany(e => e.Submissions)
            .HasForeignKey(s => s.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        // StudentAnswer -> SelectedOption (no cascade)
        builder.Entity<StudentAnswer>()
            .HasOne(a => a.SelectedOption)
            .WithMany()
            .HasForeignKey(a => a.SelectedOptionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<StudentAnswer>()
            .HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Exam optional FK to Course/Lesson
        builder.Entity<Exam>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Exams)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.Entity<Exam>()
            .HasOne(e => e.Lesson)
            .WithMany(l => l.Exams)
            .HasForeignKey(e => e.LessonId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);
    }
}
