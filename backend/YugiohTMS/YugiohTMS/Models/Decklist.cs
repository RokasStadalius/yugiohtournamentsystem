using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YugiohTMS.Models
{
    public class Decklist
    {
        [Key]
        public int ID_DeckCard { get; set; }

        [ForeignKey(nameof(Card))]
        public int ID_Card { get; set; }
        public Card Card { get; set; }

        [ForeignKey(nameof(Deck))]
        public int ID_Deck { get; set; }
        public Deck Deck { get; set; }

        public int WhichDeck { get; set; }
    }

    public class DecklistDto
    {
        public int ID_Card { get; set; }
        public int WhichDeck { get; set; } // 0 = Main, 1 = Extra, 2 = Side
    }

}
