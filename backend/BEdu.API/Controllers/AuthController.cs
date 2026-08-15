using System.Security.Claims;
using BEdu.API.Data;
using BEdu.API.DTOs.Auth;
using BEdu.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    private readonly AppDbContext _db;

    public AuthController(AuthService auth, AppDbContext db)
    {
        _auth = auth;
        _db = db;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var (success, message, data) = await _auth.RegisterAsync(dto);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var (success, message, data) = await _auth.LoginAsync(dto);
        if (!success) return Unauthorized(new { message });
        return Ok(new { message, data });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            FullNameAr = user.FullNameAr,
            FullNameEn = user.FullNameEn,
            Username = user.Username,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            Governorate = user.Governorate,
            AcademicYear = user.AcademicYear,
            CreatedAt = user.CreatedAt,
            ApprovalStatus = user.ApprovalStatus
        });
    }
}
