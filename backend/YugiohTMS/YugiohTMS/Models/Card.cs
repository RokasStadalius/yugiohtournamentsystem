using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class Card
    {
        [Key]
        public int ID_Card { get; set; }

        public required string Name { get; set; }
        public string? Type { get; set; }
        public string? FrameType { get; set; }
        public int? Atk { get; set; }
        public int? Def {  get; set; }
        public int? Level { get; set; }
        public string? Race { get; set; }
        public string? Attribute { get; set; }
        public  required string ImageURL { get; set; }

    }
}
