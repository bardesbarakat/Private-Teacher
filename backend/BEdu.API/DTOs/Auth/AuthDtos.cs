namespace BEdu.API.DTOs.Auth;

public class RegisterDto
{
    public string FullNameAr { get; set; } = string.Empty;
    public string FullNameEn { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Student | Parent | Teacher
    public string Governorate { get; set; } = string.Empty;
    public string? AcademicYear { get; set; }
}

public class LoginDto
{
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string FullNameAr { get; set; } = string.Empty;
    public string FullNameEn { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = "Approved";
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string FullNameAr { get; set; } = string.Empty;
    public string FullNameEn { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Governorate { get; set; } = string.Empty;
    public string? AcademicYear { get; set; }
    public DateTime CreatedAt { get; set; }
    public string ApprovalStatus { get; set; } = "Approved";
}
