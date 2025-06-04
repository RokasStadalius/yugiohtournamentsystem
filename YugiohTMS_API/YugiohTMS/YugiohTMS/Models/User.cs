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

        public int Rating { get; set; }

        public int TournamentsPlayed { get; set; }
        public int TournamentsWon { get; set; }

    }
}

