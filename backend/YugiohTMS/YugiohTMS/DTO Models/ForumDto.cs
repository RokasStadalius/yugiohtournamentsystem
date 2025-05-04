using System.ComponentModel.DataAnnotations;

namespace YugiohTMS.DTO_Models
{
    public class CreatePostRequest
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public int ID_User { get; set; }

        [Required]
        public int ID_ForumSection { get; set; }
    }

    public class CreateCommentRequest
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public int ID_User { get; set; }

        [Required]
        public int ID_ForumPost { get; set; }
    }
}
