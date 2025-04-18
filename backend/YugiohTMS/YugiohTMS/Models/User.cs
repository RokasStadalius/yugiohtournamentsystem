using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YugiohTMS.Models
{
    public class User
    {
        [Key]
        public int ID_User { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }

        public int IsAdmin { get; set; }

        public int IsBanned { get; set; }

        public string Bio { get; set; }

        public string ProfilePicUrl { get; set; }
    }

    public class BanRequest
    {
        [Required]
        public int ID_User { get; set; }
    }
}
