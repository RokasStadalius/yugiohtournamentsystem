namespace YugiohTMS.DTO_Models
{
    public class TournamentPlayerDto
    {
        public int ID_Tournament { get; set; }
        public int ID_User { get; set; }
        public int ID_Deck { get; set; }
        public int InitialRating { get; set; }
    }

    public class TournamentPlayersDto
    {
        public int OwnerID { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public string Winner { get; set; }
        public List<PlayerDto> Players { get; set; }
        
        public int NumOfRounds { get; set; }
    }

    public class PlayerDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string DeckName { get; set; }

        public int ID_Deck { get; set; }
        public int Rating { get; set; }
    }
}
