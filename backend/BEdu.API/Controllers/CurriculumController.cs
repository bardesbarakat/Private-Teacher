using System.Security.Claims;
using BEdu.API.Data;
using BEdu.API.DTOs.Curriculum;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurriculumController : ControllerBase
{
    private readonly AppDbContext _db;
    public CurriculumController(AppDbContext db) => _db = db;

    // GET /api/curriculum/course/{courseId}
    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetCourseCurriculum(int courseId, [FromQuery] bool includeDrafts = false)
    {
        var course = await _db.Courses
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters.OrderBy(ch => ch.OrderIndex))
                .ThenInclude(ch => ch.Lessons.OrderBy(l => l.OrderIndex))
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters)
                .ThenInclude(ch => ch.Resources)
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Chapters)
                .ThenInclude(ch => ch.Lessons)
                .ThenInclude(l => l.Resources)
            .Include(c => c.Exams)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return NotFound(new { message = "الكورس غير موجود" });

        var isTeacher = User.Identity?.IsAuthenticated == true && User.IsInRole("Teacher") && course.TeacherId == int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var showDrafts = includeDrafts && isTeacher;

        var tracks = course.Tracks.Select(t => new TrackDto
        {
            Id = t.Id,
            Type = t.Type,
            Chapters = t.Chapters
                .Where(ch => showDrafts || ch.IsPublished)
                .Select(ch => new ChapterDto
                {
                    Id = ch.Id,
                    TitleAr = ch.TitleAr,
                    TitleEn = ch.TitleEn,
                    OrderIndex = ch.OrderIndex,
                    IsPublished = ch.IsPublished,
                    Resources = ch.Resources.Select(r => new ResourceDto
                    {
                        Id = r.Id, Type = r.Type, TitleAr = r.TitleAr, TitleEn = r.TitleEn, UrlAr = r.UrlAr, UrlEn = r.UrlEn
                    }).ToList(),
                    Lessons = ch.Lessons
                        .Where(l => showDrafts || l.IsPublished)
                        .Select(l => new LessonDto
                        {
                            Id = l.Id,
                            TitleAr = l.TitleAr,
                            TitleEn = l.TitleEn,
                            OrderIndex = l.OrderIndex,
                            IsPublished = l.IsPublished,
                            VideoUrlAr = l.VideoUrlAr,
                            VideoUrlEn = l.VideoUrlEn,
                            PdfUrlAr = l.PdfUrlAr,
                            PdfUrlEn = l.PdfUrlEn,
                            ExamId = l.Exams.FirstOrDefault()?.Id,
                            Resources = l.Resources.Select(r => new ResourceDto
                            {
                                Id = r.Id, Type = r.Type, TitleAr = r.TitleAr, TitleEn = r.TitleEn, UrlAr = r.UrlAr, UrlEn = r.UrlEn
                            }).ToList()
                        }).ToList()
                }).ToList()
        }).ToList();

        return Ok(tracks);
    }

    // POST /api/curriculum/tracks
    [HttpPost("tracks")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateTrack([FromBody] CreateTrackDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);
        if (course == null) return Forbid();

        var track = new Track { CourseId = dto.CourseId, Type = dto.Type };
        _db.Tracks.Add(track);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة المسار", id = track.Id });
    }

    // POST /api/curriculum/chapters
    [HttpPost("chapters")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateChapter([FromBody] CreateChapterDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var track = await _db.Tracks.Include(t => t.Course).FirstOrDefaultAsync(t => t.Id == dto.TrackId);
        if (track == null || track.Course.TeacherId != teacherId) return Forbid();

        var chapter = new Chapter
        {
            TrackId = dto.TrackId,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            OrderIndex = dto.OrderIndex,
            IsPublished = dto.IsPublished
        };
        _db.Chapters.Add(chapter);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة الفصل", id = chapter.Id });
    }

    // PUT /api/curriculum/chapters/{id}
    [HttpPut("chapters/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> UpdateChapter(int id, [FromBody] CreateChapterDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == id);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        chapter.TitleAr = dto.TitleAr.Trim();
        chapter.TitleEn = dto.TitleEn.Trim();
        chapter.OrderIndex = dto.OrderIndex;
        chapter.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الفصل" });
    }

    // POST /api/curriculum/lessons
    [HttpPost("lessons")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == dto.ChapterId);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        var lesson = new Lesson
        {
            ChapterId = dto.ChapterId,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            OrderIndex = dto.OrderIndex,
            IsPublished = dto.IsPublished,
            VideoUrlAr = dto.VideoUrlAr,
            VideoUrlEn = dto.VideoUrlEn,
            PdfUrlAr = dto.PdfUrlAr,
            PdfUrlEn = dto.PdfUrlEn
        };
        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تمت إضافة الدرس", id = lesson.Id });
    }

    // PUT /api/curriculum/lessons/{id}
    [HttpPut("lessons/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> UpdateLesson(int id, [FromBody] CreateLessonDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();

        lesson.TitleAr = dto.TitleAr.Trim();
        lesson.TitleEn = dto.TitleEn.Trim();
        lesson.OrderIndex = dto.OrderIndex;
        lesson.IsPublished = dto.IsPublished;
        lesson.VideoUrlAr = dto.VideoUrlAr;
        lesson.VideoUrlEn = dto.VideoUrlEn;
        lesson.PdfUrlAr = dto.PdfUrlAr;
        lesson.PdfUrlEn = dto.PdfUrlEn;

        await _db.SaveChangesAsync();
        return Ok(new { message = "تم تحديث الدرس" });
    }

    // POST /api/curriculum/resources
    [HttpPost("resources")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> AddResource([FromBody] CreateResourceDto dto)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        if (dto.ChapterId.HasValue)
        {
            var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == dto.ChapterId);
            if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();
        }
        else if (dto.LessonId.HasValue)
        {
            var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == dto.LessonId);
            if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();
        }
        else
        {
            return BadRequest(new { message = "يجب تحديد فصل أو درس لإضافة المصدر إليه" });
        }

        var resource = new SupplementaryResource
        {
            ChapterId = dto.ChapterId,
            LessonId = dto.LessonId,
            Type = dto.Type,
            TitleAr = dto.TitleAr.Trim(),
            TitleEn = dto.TitleEn.Trim(),
            UrlAr = dto.UrlAr,
            UrlEn = dto.UrlEn
        };

        _db.SupplementaryResources.Add(resource);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تمت إضافة المصدر", id = resource.Id });
    }

    // DELETE endpoints for Chapter, Lesson, Resource (Optional but needed)
    [HttpDelete("chapters/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteChapter(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var chapter = await _db.Chapters.Include(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(ch => ch.Id == id);
        if (chapter == null || chapter.Track.Course.TeacherId != teacherId) return Forbid();

        _db.Chapters.Remove(chapter);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الفصل" });
    }

    [HttpDelete("lessons/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteLesson(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lesson = await _db.Lessons.Include(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson == null || lesson.Chapter.Track.Course.TeacherId != teacherId) return Forbid();

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف الدرس" });
    }

    [HttpDelete("resources/{id}")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> DeleteResource(int id)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var resource = await _db.SupplementaryResources
            .Include(r => r.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course)
            .Include(r => r.Lesson).ThenInclude(l => l.Chapter).ThenInclude(ch => ch.Track).ThenInclude(t => t.Course)
            .FirstOrDefaultAsync(r => r.Id == id);
            
        if (resource == null) return NotFound();

        // Check ownership via either Chapter or Lesson
        var course = resource.Chapter?.Track?.Course ?? resource.Lesson?.Chapter?.Track?.Course;
        if (course == null || course.TeacherId != teacherId) return Forbid();

        _db.SupplementaryResources.Remove(resource);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف المصدر" });
    }

    [HttpPost("course/{courseId}/seed-official")]
    [Authorize(Policy = "ApprovedTeacher")]
    public async Task<IActionResult> SeedOfficialCurriculum(int courseId)
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var course = await _db.Courses.Include(c => c.Tracks).FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null || course.TeacherId != teacherId) return Forbid();

        if (course.Tracks.Any(t => t.Type == "Arabic" || t.Type == "Languages"))
        {
            return BadRequest(new { message = "المنهج الرسمي موجود بالفعل لهذا الكورس" });
        }

        // Chapters Data
        var syllabus = new[]
        {
            new {
                Ar = "الوحدة الأولى: ما هي المعلومات؟", En = "Chapter 1: What is Information?",
                Lessons = new[] {
                    new { Ar = "الدرس 1-1: المعلومات والوسائط", En = "Lesson 1-1: Information and Media" },
                    new { Ar = "الدرس 1-2: أخلاقيات المعلومات", En = "Lesson 1-2: Information Ethics" }
                }
            },
            new {
                Ar = "الوحدة الثانية: القوانين والحقوق في مجتمع المعلومات", En = "Chapter 2: Regulations and Rights in the Information Society",
                Lessons = new[] {
                    new { Ar = "الدرس 2-1: البيانات الشخصية", En = "Lesson 2-1: Personal Information" },
                    new { Ar = "الدرس 2-2: حقوق الملكية الفكرية", En = "Lesson 2-2: Intellectual Property Rights" },
                    new { Ar = "الدرس 2-3: الاستخدام والإفصاح عن المعلومات", En = "Lesson 2-3: Utilization and Disclosure of Information" }
                }
            },
            new {
                Ar = "الوحدة الثالثة: أمن المعلومات", En = "Chapter 3: Information Security",
                Lessons = new[] {
                    new { Ar = "الدرس 3-1: تهديدات وإجراءات مواجهة أمن المعلومات 1", En = "Lesson 3-1: Threats and Countermeasures [1]" },
                    new { Ar = "الدرس 3-2: تهديدات وإجراءات مواجهة أمن المعلومات 2", En = "Lesson 3-2: Threats and Countermeasures [2]" },
                    new { Ar = "الدرس 3-3: التهديدات والتدابير المضادة 3", En = "Lesson 3-3: Threats and Countermeasures [3]" },
                    new { Ar = "الدرس 3-4: تقنيات المعلومات للسلامة 1", En = "Lesson 3-4: Information Technology for Safety [1]" },
                    new { Ar = "الدرس 3-5: تقنيات المعلومات للسلامة 2", En = "Lesson 3-5: Information Technology for Safety [2]" }
                }
            },
            new {
                Ar = "الوحدة الرابعة: تكنولوجيا المعلومات والمجتمع", En = "Chapter 4: Information Technology and Society",
                Lessons = new[] {
                    new { Ar = "الدرس 4-1: تطور تكنولوجيا المعلومات", En = "Lesson 4-1: Development of Information Technology" }
                }
            },
            new {
                Ar = "الوحدة الخامسة: الاتصالات", En = "Chapter 5: Communication",
                Lessons = new[] {
                    new { Ar = "الدرس 5-1: تطور وسائل الاتصال", En = "Lesson 5-1: Development of Communication Methods" },
                    new { Ar = "الدرس 5-2: أشكال الاتصال", En = "Lesson 5-2: Communication and Its Forms" },
                    new { Ar = "الدرس 5-3: الإنترنت والاتصال", En = "Lesson 5-3: Internet and Communication" }
                }
            },
            new {
                Ar = "الوحدة السادسة: تصميم المعلومات", En = "Chapter 6: Information Design",
                Lessons = new[] {
                    new { Ar = "الدرس 6-1: التناظري والرقمي", En = "Lesson 6-1: Analog and Digital" },
                    new { Ar = "الدرس 6-2: النظام الثنائي وكمية البيانات", En = "Lesson 6-2: Binary and Amount of Information" },
                    new { Ar = "الدرس 6-3: نظام السادس عشر", En = "Lesson 6-3: Hexadecimal" },
                    new { Ar = "الدرس 6-4: التمثيل الرقمي للأحرف", En = "Lesson 6-4: Digital Representation of Characters" },
                    new { Ar = "الدرس 6-5: العمليات الحسابية العددية 1", En = "Lesson 6-5: Numerical Calculations [1]" },
                    new { Ar = "الدرس 6-6: العمليات الحسابية العددية 2", En = "Lesson 6-6: Numerical Calculations [2]" },
                    new { Ar = "الدرس 6-7: رقمنة الصوت", En = "Lesson 6-7: Digitalization of Sound" },
                    new { Ar = "الدرس 6-8: رقمنة الصور", En = "Lesson 6-8: Digitization of Images" },
                    new { Ar = "الدرس 6-9: ضغط الفيديو", En = "Lesson 6-9: Compression for Videos" },
                    new { Ar = "الدرس 6-10: تصميم البيانات", En = "Lesson 6-10: Information Design" }
                }
            },
            new {
                Ar = "الوحدة السابعة: أجهزة وبرامج الكمبيوتر", En = "Chapter 7: Computers",
                Lessons = new[] {
                    new { Ar = "الدرس 7-1: بنية الكمبيوتر", En = "Lesson 7-1: Computer Configuration" },
                    new { Ar = "الدرس 7-2: برامج الكمبيوتر", En = "Lesson 7-2: Computer Software" },
                    new { Ar = "الدرس 7-3: الدوائر المنطقية", En = "Lesson 7-3: Logic Circuits" }
                }
            },
            new {
                Ar = "الوحدة الثامنة: الشبكات", En = "Chapter 8: Networks",
                Lessons = new[] {
                    new { Ar = "الدرس 8-1: شبكات الكمبيوتر", En = "Lesson 8-1: Computer Networks" },
                    new { Ar = "الدرس 8-2: عناوين IP وأسماء النطاقات", En = "Lesson 8-2: IP Addresses and Domain Names" },
                    new { Ar = "الدرس 8-3: بروتوكولات الاتصال", En = "Lesson 8-3: Communication Protocols" },
                    new { Ar = "الدرس 8-4: آلية عمل صفحات الويب", En = "Lesson 8-4: Mechanism of Web Pages" },
                    new { Ar = "الدرس 8-5: سرعة نقل البيانات", En = "Lesson 8-5: Network Transfer Speed" }
                }
            },
            new {
                Ar = "الوحدة التاسعة: قواعد البيانات", En = "Chapter 9: Databases",
                Lessons = new[] {
                    new { Ar = "الدرس 9-1: قواعد البيانات 1", En = "Lesson 9-1: Database [1]" },
                    new { Ar = "الدرس 9-2: قواعد البيانات 2", En = "Lesson 9-2: Database [2]" },
                    new { Ar = "الدرس 9-3: نظم المعلومات المختلفة", En = "Lesson 9-3: Various Information Systems" }
                }
            },
            new {
                Ar = "الوحدة العاشرة: تحليل البيانات", En = "Chapter 10: Data Analysis",
                Lessons = new[] {
                    new { Ar = "الدرس 10-1: أنواع البيانات والتحليل", En = "Lesson 10-1: Types of Data and Analysis" },
                    new { Ar = "الدرس 10-2: تقنيات تحليل البيانات 1", En = "Lesson 10-2: Data Analysis [1]" },
                    new { Ar = "الدرس 10-3: تقنيات تحليل البيانات 2", En = "Lesson 10-3: Data Analysis [2]" },
                    new { Ar = "الدرس 10-4: تقنيات تحليل البيانات 3", En = "Lesson 10-4: Data Analysis [3]" },
                    new { Ar = "الدرس 10-5: تقنيات تحليل البيانات 4", En = "Lesson 10-5: Data Analysis [4]" },
                    new { Ar = "الدرس 10-6: تقنيات تحليل البيانات 5", En = "Lesson 10-6: Data Analysis [5]" }
                }
            },
            new {
                Ar = "الوحدة الحادية عشر: المحاكاة", En = "Chapter 11: Simulations",
                Lessons = new[] {
                    new { Ar = "الدرس 11-1: النمذجة", En = "Lesson 11-1: Modeling" },
                    new { Ar = "الدرس 11-2: تجارب المحاكاة 1", En = "Lesson 11-2: Simulations [1]" },
                    new { Ar = "الدرس 11-3: تجارب المحاكاة 2", En = "Lesson 11-3: Simulations [2]" },
                    new { Ar = "الدرس 11-4: طوابير الانتظار", En = "Lesson 11-4: Queues" }
                }
            },
            new {
                Ar = "الوحدة الثانية عشر: البرمجة (بايثون)", En = "Chapter 12: Programming (Python)",
                Lessons = new[] {
                    new { Ar = "الدرس 12-1: الخوارزميات وتدفق العمليات", En = "Lesson 12-1: Algorithm & Flowcharts" },
                    new { Ar = "الدرس 12-2: أساسيات البرمجة 1", En = "Lesson 12-2: Programming Basics [1]" },
                    new { Ar = "الدرس 12-3: أساسيات البرمجة 2", En = "Lesson 12-3: Programming Basics [2]" },
                    new { Ar = "الدرس 12-4: البرمجة التطبيقية 1", En = "Lesson 12-4: Applied Programming [1]" },
                    new { Ar = "الدرس 12-5: البرمجة التطبيقية 2", En = "Lesson 12-5: Applied Programming [2]" }
                }
            },
            new {
                Ar = "الوحدة الثالثة عشر: الذكاء الاصطناعي التوليدي والويب", En = "Chapter 13: Generative AI & Web Development",
                Lessons = new[] {
                    new { Ar = "الدرس 13-1: الذكاء الاصطناعي التوليدي", En = "Lesson 13-1: Generative AI Concepts" },
                    new { Ar = "الدرس 13-2: إنشاء صفحات ثابتة بـ HTML & CSS", En = "Lesson 13-2: Static Pages HTML & CSS" },
                    new { Ar = "الدرس 13-3: صفحات تفاعلية بـ JavaScript", En = "Lesson 13-3: Interactive Pages JS" },
                    new { Ar = "الدرس 13-4: عرض تقديمي لموقع الويب", En = "Lesson 13-4: Presenting Your Website" },
                    new { Ar = "الدرس 13-5: تطوير تطبيق اختبارات", En = "Lesson 13-5: Developing Quiz App" },
                    new { Ar = "الدرس 13-6: مراجعة تطبيق الاختبارات", En = "Lesson 13-6: Review Quiz App" },
                    new { Ar = "الدرس 13-7: تطوير لعبة تكسير القوالب 1", En = "Lesson 13-7: Block Breaker Game [1]" },
                    new { Ar = "الدرس 13-8: تطوير لعبة تكسير القوالب 2", En = "Lesson 13-8: Block Breaker Game [2]" },
                    new { Ar = "الدرس 13-9: ملخص لعبة تكسير القوالب", En = "Lesson 13-9: Review Block Breaker Game" }
                }
            }
        };

        var tracks = new[] { "Arabic", "Languages" };

        foreach (var trackType in tracks)
        {
            var track = new Track { CourseId = courseId, Type = trackType };
            _db.Tracks.Add(track);
            await _db.SaveChangesAsync(); // save to get ID

            int chIndex = 1;
            foreach (var unit in syllabus)
            {
                var title = trackType == "Arabic" ? unit.Ar : unit.En;
                var chapter = new Chapter { TrackId = track.Id, TitleAr = title, TitleEn = title, OrderIndex = chIndex++, IsPublished = true };
                _db.Chapters.Add(chapter);
                await _db.SaveChangesAsync();

                int lIndex = 1;
                foreach (var lesson in unit.Lessons)
                {
                    var lTitle = trackType == "Arabic" ? lesson.Ar : lesson.En;
                    _db.Lessons.Add(new Lesson { ChapterId = chapter.Id, TitleAr = lTitle, TitleEn = lTitle, OrderIndex = lIndex++, IsPublished = true });
                }
                await _db.SaveChangesAsync();
            }
        }

        return Ok(new { message = "تمت تهيئة المنهج بنجاح" });
    }
}
