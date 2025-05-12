namespace YugiohTMS.DTO_Models
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public int IsAdmin { get; set; }
        public int UserId { get; set; }
    }

}
