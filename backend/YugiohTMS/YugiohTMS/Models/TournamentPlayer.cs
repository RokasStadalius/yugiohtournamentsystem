using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YugiohTMS.Models
{
    public class TournamentPlayer
    {
        [Key]
        public int ID_TournamentPlayer { get; set; }

        [ForeignKey(nameof(Tournament))]
        public int ID_Tournament { get; set; }

        public Tournament Tournament { get; set; }

        [ForeignKey(nameof(User))]
        public int ID_User { get; set; }

        public User User { get; set; }

        public int ID_Deck { get; set; }

        public int InitialRating { get; set; }

    }
}
