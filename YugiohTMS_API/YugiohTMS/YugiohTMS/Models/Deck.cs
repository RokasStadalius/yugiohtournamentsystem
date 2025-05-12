using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class Deck
    {
        [Key]
        public int ID_Deck { get; set; }
        public required string Name { get; set; }

        public int ID_User { get; set; }
    }

}
