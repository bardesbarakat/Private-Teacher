using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BEdu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ApprovedTeacher")] // Only teachers can upload
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [HttpPost]
    [RequestSizeLimit(524288000)] // 500 MB limit
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "لم يتم اختيار أي ملف" });

        try
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Create a unique filename
            var ext = Path.GetExtension(file.FileName);
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var fileUrl = $"{request.Scheme}://{request.Host}/uploads/{uniqueName}";

            return Ok(new { url = fileUrl, filename = file.FileName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file.");
            return StatusCode(500, new { message = "حدث خطأ أثناء رفع الملف" });
        }
    }
}
