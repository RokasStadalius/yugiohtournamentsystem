using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.Models
{
    public class ForumSection
    {
        [Key]
        public int ID_ForumSection { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        public string Description { get; set; }

        public ICollection<ForumPost> ForumPosts { get; set; } = new List<ForumPost>();
    }
}
