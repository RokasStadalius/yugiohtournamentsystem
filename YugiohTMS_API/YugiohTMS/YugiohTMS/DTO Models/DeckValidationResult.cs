namespace YugiohTMS.DTO_Models
{
    public class DeckValidationResult
    {
        public bool IsValid { get; set; }
        public int TotalCards { get; set; }
        public int MainDeckCount { get; set; }
        public int ExtraDeckCount { get; set; }
        public int SideDeckCount { get; set; }
        public List<string> Violations { get; set; }
    }

}
