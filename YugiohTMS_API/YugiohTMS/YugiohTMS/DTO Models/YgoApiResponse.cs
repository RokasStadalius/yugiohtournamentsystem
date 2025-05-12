using Newtonsoft.Json;

namespace YugiohTMS.DTO_Models
{
    public class YgoApiResponse
    {
        [JsonProperty("data")]
        public List<YgoCard> Data { get; set; }
    }

    public class YgoCard
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("banlist_info")]
        public BanlistInfo BanlistInfo { get; set; }
    }

    public class BanlistInfo
    {
        [JsonProperty("ban_tcg")]
        public string BanTcg { get; set; }
    }
}
