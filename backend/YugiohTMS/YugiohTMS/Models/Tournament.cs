using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YugiohTMS.Models
{
    public class Tournament
    {
        [Key]
        public int ID_Tournament { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        public int ID_User { get; set; }

        public required string Status { get; set; }

        public int? ID_Winner { get; set; }

        [ForeignKey("ID_Winner")]

        public virtual User? Winner { get; set; }
    }
}
