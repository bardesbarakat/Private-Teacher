using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BEdu.API.Data;
using BEdu.API.DTOs.Auth;
using BEdu.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BEdu.API.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> RegisterAsync(RegisterDto dto)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(dto.FullNameAr))
            return (false, "الاسم الكامل بالعربية مطلوب", null);
        if (string.IsNullOrWhiteSpace(dto.FullNameEn))
            return (false, "الاسم الكامل بالإنجليزية مطلوب", null);
        if (string.IsNullOrWhiteSpace(dto.Username))
            return (false, "اسم المستخدم مطلوب", null);
        if (string.IsNullOrWhiteSpace(dto.Email))
            return (false, "البريد الإلكتروني مطلوب", null);
        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
            return (false, "رقم الهاتف مطلوب", null);
        if (string.IsNullOrWhiteSpace(dto.Password))
            return (false, "كلمة المرور مطلوبة", null);
        if (dto.Password != dto.ConfirmPassword)
            return (false, "كلمتا المرور غير متطابقتين", null);
        if (dto.Password.Length < 8)
            return (false, "يجب أن تكون كلمة المرور 8 أحرف على الأقل", null);
        if (string.IsNullOrWhiteSpace(dto.Governorate))
            return (false, "المحافظة مطلوبة", null);

        var validRoles = new[] { "Student", "Parent", "Teacher" };
        if (!validRoles.Contains(dto.Role))
            return (false, "الدور غير صالح. يجب أن يكون: Student، Parent، أو Teacher", null);

        // Uniqueness checks
        var emailExists = await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower());
        if (emailExists)
            return (false, "البريد الإلكتروني مستخدم بالفعل", null);

        var usernameExists = await _db.Users.AnyAsync(u => u.Username == dto.Username.ToLower());
        if (usernameExists)
            return (false, "اسم المستخدم مستخدم بالفعل", null);

        var user = new User
        {
            FullNameAr = dto.FullNameAr.Trim(),
            FullNameEn = dto.FullNameEn.Trim(),
            Username = dto.Username.Trim().ToLower(),
            Email = dto.Email.Trim().ToLower(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            Governorate = dto.Governorate,
            AcademicYear = dto.AcademicYear,
            ApprovalStatus = dto.Role == "Teacher" ? "Pending" : "Approved"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);
        return (true, "تم إنشاء الحساب بنجاح", new AuthResponseDto
        {
            Token = token,
            Role = user.Role,
            UserId = user.Id,
            FullNameAr = user.FullNameAr,
            FullNameEn = user.FullNameEn,
            Username = user.Username,
            Email = user.Email,
            ApprovalStatus = user.ApprovalStatus
        });
    }

    public async Task<(bool Success, string Message, AuthResponseDto? Data)> LoginAsync(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.EmailOrUsername) || string.IsNullOrWhiteSpace(dto.Password))
            return (false, "يرجى إدخال بيانات الدخول", null);

        var identifier = dto.EmailOrUsername.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Email == identifier || u.Username == identifier);

        if (user == null)
            return (false, "البريد الإلكتروني أو اسم المستخدم غير موجود", null);

        if (!user.IsActive)
            return (false, "الحساب غير مفعّل. تواصل مع الإدارة", null);

        if (user.ApprovalStatus == "Rejected")
            return (false, "تم رفض طلب الانضمام الخاص بك. تواصل مع الإدارة.", null);

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return (false, "كلمة المرور غير صحيحة", null);

        var token = GenerateJwt(user);
        return (true, "تم تسجيل الدخول بنجاح", new AuthResponseDto
        {
            Token = token,
            Role = user.Role,
            UserId = user.Id,
            FullNameAr = user.FullNameAr,
            FullNameEn = user.FullNameEn,
            Username = user.Username,
            Email = user.Email,
            ApprovalStatus = user.ApprovalStatus
        });
    }

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("fullNameAr", user.FullNameAr),
            new Claim("fullNameEn", user.FullNameEn),
            new Claim("approvalStatus", user.ApprovalStatus)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
