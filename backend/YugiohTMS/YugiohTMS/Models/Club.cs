using Microsoft.AspNetCore.Components.Routing;
using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class Club
    {
        [Key]
        public int ID_Club { get; set; }
        public string Name { get; set; }
        public int ID_Owner { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
    }

    public class ClubDto
    {
        public int ID_Club { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int ID_Owner { get; set; }
    }

    public class ClubsResponse
    {
        public List<ClubDto> Clubs { get; set; }
    }

    public class ClubCreateModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public int ID_Owner { get; set; }
    }
}
