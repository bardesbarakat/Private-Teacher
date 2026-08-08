using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.DTOs;
using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EduPlatform.API.Services;

public class AuthService(AppDbContext db, IConfiguration config)
{
    public async Task<(bool Success, string? Error, AuthResponse? Response)> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return (false, "البريد الإلكتروني مستخدم مسبقاً", null);

        var user = new User
        {
            FirstName = req.FirstName,
            LastName   = req.LastName,
            Email      = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone  = req.Phone,
            Grade  = req.Grade,
            City   = req.City,
            Role   = "Student"
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (true, null, BuildAuthResponse(user));
    }

    public async Task<(bool Success, string? Error, AuthResponse? Response)> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return (false, "البريد الإلكتروني أو كلمة المرور غير صحيحة", null);

        if (!user.IsActive)
            return (false, "تم تعليق هذا الحساب. يرجى التواصل مع الدعم.", null);

        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (true, null, BuildAuthResponse(user));
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var token = GenerateJwt(user);
        return new AuthResponse(token, "Bearer", 86400, MapUser(user));
    }

    private string GenerateJwt(User user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("fullName", $"{user.FirstName} {user.LastName}")
        };
        var token = new JwtSecurityToken(
            issuer:   config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims:   claims,
            expires:  DateTime.UtcNow.AddDays(1),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static UserDto MapUser(User u) => new(
        u.Id, u.FirstName, u.LastName, u.Email,
        u.Phone, u.Grade, u.Role, u.City, u.AvatarUrl, u.CreatedAt);
}
