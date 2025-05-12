using YugiohTMS.Models;

namespace YugiohTMS.DTO_Models
{
    public class SyncResponseDto
    {
        public string Message { get; set; }
        public List<Card> NewCards { get; set; }
        public int TotalProcessed { get; set; }
    }

}
