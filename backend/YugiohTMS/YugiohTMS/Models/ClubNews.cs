using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ClubNews
    {
        [Key]
        public int ID_ClubNews { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ID_Club { get; set; }
        public Club Club { get; set; }
        public int ID_User { get; set; }
        public User User { get; set; }
    }
}
