using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.DTO_Models
{
    public class BanRequest
    {
        [Required]
        public int ID_User { get; set; }
    }
}
