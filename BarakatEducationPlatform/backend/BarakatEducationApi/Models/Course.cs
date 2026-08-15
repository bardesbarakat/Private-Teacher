using System.ComponentModel.DataAnnotations;

namespace BarakatEducationApi.Models
{
    public class Course
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string Instructor { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int Credits { get; set; }
    }
}