using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class User
    {
        [Key]
        public int ID_User { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
    }
}
