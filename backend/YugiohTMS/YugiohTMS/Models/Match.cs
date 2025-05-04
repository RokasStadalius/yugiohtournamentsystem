using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YugiohTMS.Models
{
    public class Match
    {
        [Key]
        public int ID_Match { get; set; }

        [Required]
        public int ID_Tournament { get; set; }

        [ForeignKey("ID_Tournament")]
        public virtual Tournament Tournament { get; set; }

        [Required]
        public int RoundNumber { get; set; }

        [Column("ID_User1")]
        public int? ID_User1 { get; set; }

        [Column("ID_User2")]
        public int? ID_User2 { get; set; }

        [Column("ID_Winner")]
        public int? ID_Winner { get; set; }

        public int? Score1 { get; set; }
        public int? Score2 { get; set; }

        [Required]
        public string Status { get; set; } = "Scheduled";

        public int? ID_NextMatch { get; set; }
    }
}
