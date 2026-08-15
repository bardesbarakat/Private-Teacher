using System.ComponentModel.DataAnnotations;

namespace BarakatEducationApi.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string Password { get; set; }

        public DateTime DateOfBirth { get; set; }

        public string PhoneNumber { get; set; }

        public string Address { get; set; }
    }
}