using Microsoft.AspNetCore.Components.Routing;
using System.ComponentModel.DataAnnotations;
using YugiohTMS.DTO_Models;

namespace YugiohTMS.Models
{
    public class Club
    {
        [Key]
        public int ID_Club { get; set; }
        public string Name { get; set; }
        public User Owner { get; set; }
        public int ID_Owner { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }

        public List<ClubNews> News { get; set; } = new();

        public string Visibility { get; set; }
    }

}
