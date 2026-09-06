using BEdu.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<Chapter> Chapters => Set<Chapter>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<SupplementaryResource> SupplementaryResources => Set<SupplementaryResource>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();
    public DbSet<ExamSubmission> ExamSubmissions => Set<ExamSubmission>();
    public DbSet<StudentAnswer> StudentAnswers => Set<StudentAnswer>();
    
    public DbSet<LiveSession> LiveSessions => Set<LiveSession>();
    public DbSet<SessionAttendance> SessionAttendances => Set<SessionAttendance>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();

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

        // Track -> Chapter
        builder.Entity<Chapter>()
            .HasOne(c => c.Track)
            .WithMany(t => t.Chapters)
            .HasForeignKey(c => c.TrackId)
            .OnDelete(DeleteBehavior.Cascade);

        // Chapter -> Lesson
        builder.Entity<Lesson>()
            .HasOne(l => l.Chapter)
            .WithMany(c => c.Lessons)
            .HasForeignKey(l => l.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);

        // SupplementaryResource relationships
        builder.Entity<SupplementaryResource>()
            .HasOne(s => s.Chapter)
            .WithMany(c => c.Resources)
            .HasForeignKey(s => s.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<SupplementaryResource>()
            .HasOne(s => s.Lesson)
            .WithMany(l => l.Resources)
            .HasForeignKey(s => s.LessonId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.Entity<Exam>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Exams)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.Entity<Exam>()
            .HasOne(e => e.Lesson)
            .WithMany(l => l.Exams)
            .HasForeignKey(e => e.LessonId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        // SessionAttendance
        builder.Entity<SessionAttendance>()
            .HasOne(sa => sa.Student)
            .WithMany()
            .HasForeignKey(sa => sa.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<SessionAttendance>()
            .HasOne(sa => sa.Session)
            .WithMany(s => s.Attendances)
            .HasForeignKey(sa => sa.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // LessonProgress
        builder.Entity<LessonProgress>()
            .HasOne(lp => lp.Student)
            .WithMany()
            .HasForeignKey(lp => lp.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LessonProgress>()
            .HasOne(lp => lp.Lesson)
            .WithMany()
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
