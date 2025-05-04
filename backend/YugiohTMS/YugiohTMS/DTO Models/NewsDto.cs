namespace YugiohTMS.DTO_Models
{
    public class NewsDto
    {
        public int ID_ClubNews { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class NewsCreateWithUserIdDto
    {
        public string Content { get; set; }
        public int UserId { get; set; }
    }
}
