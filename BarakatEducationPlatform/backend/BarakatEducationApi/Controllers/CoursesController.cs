using Microsoft.AspNetCore.Mvc;
using BarakatEducationApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace BarakatEducationApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private static List<Course> courses = new List<Course>
        {
            new Course { Id = 1, Title = "Introduction to Programming", Description = "Learn the basics of programming.", Duration = "4 weeks" },
            new Course { Id = 2, Title = "Web Development", Description = "Build websites using HTML, CSS, and JavaScript.", Duration = "6 weeks" }
        };

        [HttpGet]
        public ActionResult<IEnumerable<Course>> GetCourses()
        {
            return Ok(courses);
        }

        [HttpGet("{id}")]
        public ActionResult<Course> GetCourse(int id)
        {
            var course = courses.FirstOrDefault(c => c.Id == id);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }

        [HttpPost]
        public ActionResult<Course> CreateCourse(Course course)
        {
            course.Id = courses.Max(c => c.Id) + 1;
            courses.Add(course);
            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        [HttpPut("{id}")]
        public ActionResult UpdateCourse(int id, Course updatedCourse)
        {
            var course = courses.FirstOrDefault(c => c.Id == id);
            if (course == null)
            {
                return NotFound();
            }
            course.Title = updatedCourse.Title;
            course.Description = updatedCourse.Description;
            course.Duration = updatedCourse.Duration;
            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteCourse(int id)
        {
            var course = courses.FirstOrDefault(c => c.Id == id);
            if (course == null)
            {
                return NotFound();
            }
            courses.Remove(course);
            return NoContent();
        }
    }
}