using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ClubInvitation
    {
        [Key]
        public int ID_ClubInvitation { get; set; }
        public int ID_Club { get; set; }
        public int ID_User { get; set; }

        public string Status { get; set; }

        public virtual Club Club { get; set; }
    }
}
