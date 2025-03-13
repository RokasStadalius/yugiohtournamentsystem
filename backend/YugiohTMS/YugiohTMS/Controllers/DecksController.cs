using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DecksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DecksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Decks
        [HttpPost("create-deck")]
        public async Task<IActionResult> CreateDeck([FromBody] Deck deck)
        {
            if (string.IsNullOrWhiteSpace(deck.Name))
            {
                return BadRequest("Deck name is required.");
            }

            var userExists = await _context.User.AnyAsync(u => u.ID_User == deck.ID_User);
            if (!userExists)
            {
                return BadRequest($"User with ID {deck.ID_User} does not exist.");
            }

            var newDeck = new Deck
            {
                Name = deck.Name,
                ID_User = deck.ID_User
            };

            _context.Deck.Add(newDeck);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDeckById), new { id = newDeck.ID_Deck }, newDeck);
        }

        // GET: api/Decks/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Deck>> GetDeckById(int id)
        {
            var deck = await _context.Deck.FindAsync(id);

            if (deck == null)
            {
                return NotFound();
            }

            return deck;
        }

        // GET: api/decks/user/{userId}
        [HttpGet("user/{ID_User}")]
        public async Task<ActionResult<IEnumerable<Deck>>> GetUserDecks(int ID_User)
        {
            var userExists = await _context.User.AnyAsync(u => u.ID_User == ID_User);
            if (!userExists)
            {
                return NotFound($"User with ID {ID_User} does not exist.");
            }

            var userDecks = await _context.Deck
                .Where(d => d.ID_User == ID_User)
                .ToListAsync();

            return Ok(userDecks);
        }

        [HttpGet("decklist/{ID_Deck}")]
        public async Task<ActionResult<IEnumerable<Decklist>>> GetDeckCards(int ID_Deck)
        {
            var deckExists = await _context.Deck.AnyAsync(d => d.ID_Deck == ID_Deck);
            if (!deckExists)
            {
                return NotFound($"Deck with ID {ID_Deck} does not exist.");
            }

            var deckCards = await _context.Decklist
                .Include(dl => dl.Card)
                .Where(dl => dl.ID_Deck == ID_Deck)
                .ToListAsync();

            if (deckCards == null || !deckCards.Any())
            {
                return NotFound("No cards found for this deck.");
            }

            return Ok(deckCards);
        }

        [HttpPost("decklist/{deckId}")]
        public async Task<IActionResult> SaveDecklist(int deckId, [FromBody] List<DecklistDto> deckCards)
        {
            if (deckCards == null || !deckCards.Any())
            {
                return BadRequest("Decklist is empty.");
            }

            var deckExists = await _context.Deck.AnyAsync(d => d.ID_Deck == deckId);
            if (!deckExists)
            {
                return NotFound($"Deck with ID {deckId} does not exist.");
            }

            var existingDeckCards = _context.Decklist.Where(dl => dl.ID_Deck == deckId);
            _context.Decklist.RemoveRange(existingDeckCards);

            foreach (var dto in deckCards)
            {
                var newDeckCard = new Decklist
                {
                    ID_Card = dto.ID_Card,
                    ID_Deck = deckId,
                    WhichDeck = dto.WhichDeck
                };

                _context.Decklist.Add(newDeckCard);
            }

            await _context.SaveChangesAsync();

            return Ok("Decklist saved successfully.");
        }


    }
}
