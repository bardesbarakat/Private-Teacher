using EduPlatform.API.Models;
using BCrypt.Net;

namespace EduPlatform.API.Data;

public static class DataSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Courses.Any()) return; // Already seeded

        // ── Users ──────────────────────────────────────────────────────────
        var users = new List<User>
        {
            new() {
                FirstName = "محمود", LastName = "أحمد",
                Email = "student@edu.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@1234"),
                Grade = "bac1", Role = "Student", City = "القاهرة"
            },
            new() {
                FirstName = "Admin", LastName = "EduPlatform",
                Email = "admin@edu.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
                Grade = "bac2", Role = "Admin", City = "القاهرة"
            }
        };
        context.Users.AddRange(users);
        context.SaveChanges();

        // ── Courses ────────────────────────────────────────────────────────
        var courses = new List<Course>
        {
            new() {
                Title = "الكورس التأسيسي | أولى بكالوريا",
                ShortDescription = "تأسيس قوي في البرمجة واكتشاف عالم الذكاء الاصطناعي من البداية.",
                Description = "كورس التأسيس الكامل لطلاب أولى بكالوريا: نبدأ من الصفر تمامًا — التفكير البرمجي وحل المشكلات، أساسيات البرمجة بلغة Python، وأول خطواتك في عالم الذكاء الاصطناعي.",
                Category = "bac1", Level = "beginner", IsFree = true,
                TelegramUrl = "https://t.me/eduplatform_bac1", Order = 1,
                Features = [
                    new() { Text = "التفكير الحسابي وحل المشكلات", Order = 1 },
                    new() { Text = "أساسيات البرمجة بلغة Python", Order = 2 },
                    new() { Text = "الخوارزميات وهياكل البيانات البسيطة", Order = 3 },
                    new() { Text = "مقدمة في الذكاء الاصطناعي ومجالاته", Order = 4 }
                ]
            },
            new() {
                Title = "الكورس المتقدم | أولى بكالوريا",
                ShortDescription = "تعمّق في مفاهيم البرمجة المتقدمة لأولى بكالوريا.",
                Description = "بعد اتقان الأساسيات، ننتقل إلى مفاهيم أعمق في Python وتطبيقات ذكاء اصطناعي بسيطة تناسب منهج أولى بكالوريا.",
                Category = "bac1", Level = "intermediate", IsFree = false, Price = 299,
                TelegramUrl = "https://t.me/eduplatform_bac1_adv", Order = 2,
                Features = [
                    new() { Text = "الدوال والوحدات في Python", Order = 1 },
                    new() { Text = "معالجة الملفات والاستثناءات", Order = 2 },
                    new() { Text = "مشاريع تطبيقية متكاملة", Order = 3 },
                    new() { Text = "تمارين على نمط الامتحان الرسمي", Order = 4 }
                ]
            },
            new() {
                Title = "الكورس التأسيسي | تانية بكالوريا",
                ShortDescription = "ارتقِ بمهاراتك لمستوى تانية بكالوريا مع OOP والذكاء الاصطناعي.",
                Description = "انتقل لمستوى أعلى في البرمجة كائنية التوجه OOP وابنِ تطبيقات ذكاء اصطناعي عملية تستعد بها لامتحان تانية بكالوريا.",
                Category = "bac2", Level = "intermediate", IsFree = true,
                TelegramUrl = "https://t.me/eduplatform_bac2", Order = 3,
                Features = [
                    new() { Text = "البرمجة كائنية التوجه (OOP)", Order = 1 },
                    new() { Text = "هياكل بيانات وخوارزميات متقدمة", Order = 2 },
                    new() { Text = "بناء تطبيقات ذكاء اصطناعي عملية", Order = 3 },
                    new() { Text = "أساسيات تحليل البيانات", Order = 4 }
                ]
            },
            new() {
                Title = "مراجعة مكثّفة | أولى بكالوريا",
                ShortDescription = "مراجعة شاملة ونماذج امتحانات لضمان أعلى الدرجات.",
                Description = "كورس مراجعة مكثّفة يغطي كامل منهج أولى بكالوريا مع نماذج امتحانات متكررة وتدريبات على أسلوب الأسئلة الرسمية.",
                Category = "intensive", Level = "beginner", IsFree = false, Price = 199,
                TelegramUrl = "https://t.me/eduplatform_review", Order = 4,
                Features = [
                    new() { Text = "نماذج امتحانات السنوات السابقة", Order = 1 },
                    new() { Text = "تدريبات على نمط الامتحان الرسمي", Order = 2 },
                    new() { Text = "مراجعة سريعة للمفاهيم الأساسية", Order = 3 },
                    new() { Text = "جلسات أسئلة وأجوبة مباشرة", Order = 4 }
                ]
            }
        };
        context.Courses.AddRange(courses);
        context.SaveChanges();

        // ── Lessons (for Course 1) ─────────────────────────────────────────
        var course1 = courses[0];
        var lessons = new List<Lesson>
        {
            new() { CourseId = course1.Id, Title = "مقدمة في التفكير البرمجي", ChapterTitle = "التفكير البرمجي وحل المشكلات", ChapterOrder = 1, Order = 1, DurationSeconds = 1125 },
            new() { CourseId = course1.Id, Title = "تمثيل المعلومات والبيانات", ChapterTitle = "التفكير البرمجي وحل المشكلات", ChapterOrder = 1, Order = 2, DurationSeconds = 1330 },
            new() { CourseId = course1.Id, Title = "خوارزميات بسيطة", ChapterTitle = "التفكير البرمجي وحل المشكلات", ChapterOrder = 1, Order = 3, DurationSeconds = 930 },
            new() { CourseId = course1.Id, Title = "المتغيرات وأنواع البيانات", ChapterTitle = "أساسيات Python", ChapterOrder = 2, Order = 4, DurationSeconds = 1215 },
            new() { CourseId = course1.Id, Title = "العمليات والتعبيرات", ChapterTitle = "أساسيات Python", ChapterOrder = 2, Order = 5, DurationSeconds = 1060 },
            new() { CourseId = course1.Id, Title = "الشرط والتحكم في التدفق", ChapterTitle = "أساسيات Python", ChapterOrder = 2, Order = 6, DurationSeconds = 1500 },
            new() { CourseId = course1.Id, Title = "الحلقات التكرارية", ChapterTitle = "أساسيات Python", ChapterOrder = 2, Order = 7, DurationSeconds = 1375 },
            new() { CourseId = course1.Id, Title = "القوائم والمصفوفات", ChapterTitle = "الخوارزميات وهياكل البيانات", ChapterOrder = 3, Order = 8, DurationSeconds = 1160 },
            new() { CourseId = course1.Id, Title = "البحث والترتيب", ChapterTitle = "الخوارزميات وهياكل البيانات", ChapterOrder = 3, Order = 9, DurationSeconds = 1690 }
        };
        context.Lessons.AddRange(lessons);
        context.SaveChanges();

        // ── Exam + Questions (for Course 1) ───────────────────────────────
        var exam = new Exam
        {
            CourseId = course1.Id,
            Title = "اختبار: أساسيات Python",
            Description = "اختبر معلوماتك في أساسيات البرمجة بلغة Python",
            TimeLimitMinutes = 20,
            PassingScore = 60
        };
        context.Exams.Add(exam);
        context.SaveChanges();

        var questions = new List<Question>
        {
            new() { ExamId = exam.Id, Order = 1,
                Text = "ما هو ناتج الكود التالي؟", CodeBlock = "print(type(5))",
                OptionA = "<class 'int'>", OptionB = "<class 'str'>",
                OptionC = "<class 'float'>", OptionD = "5",
                CorrectOption = "A", Explanation = "الرقم 5 هو عدد صحيح (integer) في Python، لذا type(5) يُعيد <class 'int'>" },
            new() { ExamId = exam.Id, Order = 2,
                Text = "أي من التالي يُعرِّف قائمة (list) في Python؟",
                OptionA = "x = (1, 2, 3)", OptionB = "x = [1, 2, 3]",
                OptionC = "x = {1, 2, 3}", OptionD = "x = <1, 2, 3>",
                CorrectOption = "B", Explanation = "القوائم في Python تُعرَّف باستخدام الأقواس المربعة []" },
            new() { ExamId = exam.Id, Order = 3,
                Text = "ما هو ناتج: 10 % 3 ؟",
                OptionA = "3", OptionB = "1", OptionC = "3.33", OptionD = "0",
                CorrectOption = "B", Explanation = "عامل % يُعيد باقي القسمة: 10 ÷ 3 = 3 والباقي 1" },
            new() { ExamId = exam.Id, Order = 4,
                Text = "ما الكلمة المفتاحية لتعريف دالة في Python؟",
                OptionA = "function", OptionB = "void", OptionC = "def", OptionD = "fun",
                CorrectOption = "C", Explanation = "في Python تُعرَّف الدوال باستخدام الكلمة المفتاحية def" },
            new() { ExamId = exam.Id, Order = 5,
                Text = "ما هو ناتج: len('Hello') ؟",
                OptionA = "4", OptionB = "6", OptionC = "5", OptionD = "خطأ",
                CorrectOption = "C", Explanation = "كلمة 'Hello' تحتوي على 5 أحرف، لذا len تُعيد 5" },
            new() { ExamId = exam.Id, Order = 6,
                Text = "أي من التالي يطبع أرقام من 1 إلى 5؟",
                OptionA = "for i in range(1, 5):", OptionB = "for i in range(5):",
                OptionC = "for i in range(1, 6):", OptionD = "for i in range(0, 5):",
                CorrectOption = "C", Explanation = "range(1, 6) تُنتج الأرقام 1, 2, 3, 4, 5 — والرقم الأخير غير مُضمَّن" },
            new() { ExamId = exam.Id, Order = 7,
                Text = "ما هو ناتج: 'edu' + 'platform' ؟",
                OptionA = "eduplatform", OptionB = "edu platform",
                OptionC = "edu+platform", OptionD = "خطأ في النوع",
                CorrectOption = "A", Explanation = "عامل + مع النصوص يقوم بالدمج (concatenation)" },
            new() { ExamId = exam.Id, Order = 8,
                Text = "كيف تكتب تعليق في Python؟",
                OptionA = "// تعليق", OptionB = "/* تعليق */", OptionC = "# تعليق", OptionD = "-- تعليق",
                CorrectOption = "C", Explanation = "في Python تبدأ التعليقات بالرمز # ويمتد التعليق حتى نهاية السطر" },
            new() { ExamId = exam.Id, Order = 9,
                Text = "ما هو ناتج: bool(0) ؟",
                OptionA = "True", OptionB = "False", OptionC = "0", OptionD = "None",
                CorrectOption = "B", Explanation = "في Python القيمة 0 تُحوَّل إلى False عند تحويلها لقيمة منطقية" },
            new() { ExamId = exam.Id, Order = 10,
                Text = "ما الفرق بين = و == في Python؟",
                OptionA = "لا فرق بينهما", OptionB = "= للمقارنة و == للتعيين",
                OptionC = "= للتعيين و == للمقارنة", OptionD = "كلاهما للمقارنة",
                CorrectOption = "C", Explanation = "= يُستخدم لتعيين قيمة للمتغير، بينما == يُستخدم لمقارنة قيمتين" }
        };
        context.Questions.AddRange(questions);
        context.SaveChanges();
    }
}
