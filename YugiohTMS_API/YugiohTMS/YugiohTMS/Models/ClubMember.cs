using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ClubMember
    {
        [Key]
        public int ID_ClubMember { get; set; }
        public int ID_Club { get; set; }
        public int ID_User { get; set; }
    }
}
