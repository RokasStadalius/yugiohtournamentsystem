using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class Tournament
    {
        [Key]
        public int ID_Tournament { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        public int ID_User { get; set; }
    }
}
