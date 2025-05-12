using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ForumPostComment
    {
        [Key]
        public int ID_ForumPostComment { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public int ID_User { get; set; }

        [Required]
        public int ID_ForumPost { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public ForumPost ForumPost { get; set; }
    }
}
