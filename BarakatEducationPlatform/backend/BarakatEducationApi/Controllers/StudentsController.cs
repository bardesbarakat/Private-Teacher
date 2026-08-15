using Microsoft.AspNetCore.Mvc;
using BarakatEducationApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace BarakatEducationApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private static List<Student> students = new List<Student>();

        [HttpPost("register")]
        public ActionResult<Student> Register(Student student)
        {
            students.Add(student);
            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
        }

        [HttpPost("login")]
        public ActionResult<Student> Login(string email, string password)
        {
            var student = students.FirstOrDefault(s => s.Email == email && s.Password == password);
            if (student == null)
            {
                return Unauthorized();
            }
            return Ok(student);
        }

        [HttpGet("{id}")]
        public ActionResult<Student> GetStudent(int id)
        {
            var student = students.FirstOrDefault(s => s.Id == id);
            if (student == null)
            {
                return NotFound();
            }
            return Ok(student);
        }

        [HttpGet]
        public ActionResult<IEnumerable<Student>> GetAllStudents()
        {
            return Ok(students);
        }
    }
}