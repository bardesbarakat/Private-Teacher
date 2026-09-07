using BEdu.API.Data;
using BEdu.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonCodeController : ControllerBase
{
    private readonly AppDbContext _context;

    public LessonCodeController(AppDbContext context)
    {
        _context = context;
    }

    private string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars like I,1,O,0
        var data = new byte[length];
        using (var crypto = RandomNumberGenerator.Create())
        {
            crypto.GetBytes(data);
        }
        var result = new StringBuilder(length);
        foreach (byte b in data)
        {
            result.Append(chars[b % chars.Length]);
        }
        return result.ToString();
    }

    [HttpPost("/api/teacher/lessons/{lessonId}/generate-codes")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GenerateCodes(int lessonId, [FromBody] GenerateCodesRequest request)
    {
        var lesson = await _context.Lessons.FindAsync(lessonId);
        if (lesson == null) return NotFound("Lesson not found.");

        int count = request.Count > 0 ? request.Count : 10;
        int maxRetries = count * 2;
        var generatedCodes = new List<LessonActivationCode>();

        for (int i = 0; i < count; i++)
        {
            string newCode = "";
            bool isUnique = false;
            int retries = 0;
            
            while (!isUnique && retries < maxRetries)
            {
                newCode = GenerateRandomCode(8);
                bool exists = await _context.LessonActivationCodes.AnyAsync(c => c.Code == newCode);
                if (!exists)
                {
                    isUnique = true;
                }
                retries++;
            }

            if (!isUnique) return StatusCode(500, "Failed to generate unique codes.");

            var codeEntity = new LessonActivationCode
            {
                Code = newCode,
                LessonId = lessonId,
                ExpiresAt = request.ExpiresInDays.HasValue ? DateTime.UtcNow.AddDays(request.ExpiresInDays.Value) : null
            };
            
            _context.LessonActivationCodes.Add(codeEntity);
            generatedCodes.Add(codeEntity);
        }

        await _context.SaveChangesAsync();

        var baseUrl = "https://bedu-sigma.vercel.app";
        
        var response = generatedCodes.Select(c => new
        {
            c.Id,
            c.Code,
            c.IsUsed,
            c.CreatedAt,
            c.ExpiresAt,
            RedeemUrl = $"{baseUrl}/redeem?code={c.Code}"
        });

        return Ok(response);
    }

    [HttpGet("/api/teacher/lessons/{lessonId}/codes")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetLessonCodes(int lessonId)
    {
        var codes = await _context.LessonActivationCodes
            .Where(c => c.LessonId == lessonId)
            .Select(c => new {
                c.Id,
                c.Code,
                c.IsUsed,
                c.CreatedAt,
                c.RedeemedAt,
                c.RedeemedByStudentId,
                RedeemedByStudentName = c.RedeemedByStudent != null ? c.RedeemedByStudent.FullNameAr : null,
                RedeemUrl = $"https://bedu-sigma.vercel.app/redeem?code={c.Code}"
            })
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(codes);
    }

    [HttpPost("/api/student/lessons/redeem-code")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> RedeemCode([FromBody] RedeemCodeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code)) return BadRequest("Code is required.");

        var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(studentIdClaim) || !int.TryParse(studentIdClaim, out int studentId))
            return Unauthorized();

        var code = request.Code.Trim().ToUpper();

        // Check if code exists
        var activationCode = await _context.LessonActivationCodes
            .Include(c => c.Lesson)
            .FirstOrDefaultAsync(c => c.Code == code);

        if (activationCode == null) return NotFound(new { message = "Invalid code." });

        if (activationCode.IsUsed) return BadRequest(new { message = "This code has already been used." });

        if (activationCode.ExpiresAt.HasValue && activationCode.ExpiresAt.Value < DateTime.UtcNow)
            return BadRequest(new { message = "This code has expired." });

        // Check if student already has access
        var existingAccess = await _context.StudentLessonAccesses
            .AnyAsync(a => a.StudentId == studentId && a.LessonId == activationCode.LessonId);

        if (existingAccess)
            return BadRequest(new { message = "You already have access to this lesson." });

        // Proceed to unlock
        activationCode.IsUsed = true;
        activationCode.RedeemedAt = DateTime.UtcNow;
        activationCode.RedeemedByStudentId = studentId;

        var access = new StudentLessonAccess
        {
            StudentId = studentId,
            LessonId = activationCode.LessonId,
            UnlockedAt = DateTime.UtcNow
        };

        _context.StudentLessonAccesses.Add(access);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { 
                message = "Lesson unlocked successfully!", 
                lessonId = activationCode.LessonId,
                lessonTitle = activationCode.Lesson.TitleAr
            });
        }
        catch (DbUpdateException)
        {
            // Concurrency issue (code used at the exact same time)
            return StatusCode(500, new { message = "Failed to redeem code. It might have been used just now." });
        }
    }
}

public class GenerateCodesRequest
{
    public int Count { get; set; } = 10;
    public int? ExpiresInDays { get; set; }
}

public class RedeemCodeRequest
{
    public string Code { get; set; } = string.Empty;
}
