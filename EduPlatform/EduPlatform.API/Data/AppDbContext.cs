using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseFeature> CourseFeatures => Set<CourseFeature>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonResource> LessonResources => Set<LessonResource>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<ExamResult> ExamResults => Set<ExamResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique constraints
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Enrollment>()
            .HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();

        modelBuilder.Entity<LessonProgress>()
            .HasIndex(lp => new { lp.UserId, lp.LessonId }).IsUnique();

        // Decimal precision
        modelBuilder.Entity<Course>()
            .Property(c => c.Price).HasColumnType("decimal(18,2)");

        // Cascade settings
        modelBuilder.Entity<Note>()
            .HasOne(n => n.User).WithMany(u => u.Notes)
            .HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ExamResult>()
            .HasOne(r => r.User).WithMany(u => u.ExamResults)
            .HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.User).WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
