using System.ComponentModel.DataAnnotations;
using YugiohTMS.Models;

namespace YugiohTMS.DTO_Models
{
    public class ClubDto
    {
        public int ID_Club { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int ID_Owner { get; set; }
        
        public string OwnerUsername { get; set; }
        public List<NewsDto> News { get; set; }

        public string Visibility { get; set; }
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

        [Required]

        public string Visibility { get; set; }
    }

    public class ClubsResponse
    {
        public List<ClubDto> Clubs { get; set; }
    }

    public class JoinClubRequest
    {
        public int UserId { get; set; }
    }

    public class InvitationRequest
    {
        public int UserIdToInvite { get; set; }
        public int CurrentUserId { get; set; }
    }

    public class UserRequest
    {
        public int UserId { get; set; }
    }
}
