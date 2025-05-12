using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ForumPost
    {
        [Key]
        public int ID_ForumPost { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public int ID_User { get; set; }

        [Required]
        public int ID_ForumSection { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public User User { get; set; } 
        public ForumSection ForumSection { get; set; }
        public ICollection<ForumPostComment> ForumPostComments { get; set; } = new List<ForumPostComment>();
    }
}
