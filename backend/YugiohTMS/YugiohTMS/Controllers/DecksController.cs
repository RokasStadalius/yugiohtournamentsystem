using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Globalization;
using System.Net.Http;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DecksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        private readonly IHttpClientFactory _httpClientFactory;

        public DecksController(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

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

        [HttpGet("validate-deck/{deckId}")]
        public async Task<ActionResult> ValidateDeck(int deckId)
        {
            const int maxUnlimited = 3;
            const int maxSemiLimited = 2;
            const int maxLimited = 1;
            const int maxForbidden = 0;

            var deckCards = await _context.Decklist
                .Include(dc => dc.Card)
                .Where(dc => dc.ID_Deck == deckId)
                .ToListAsync();

            if (!deckCards.Any())
            {
                return NotFound("Deck not found or empty");
            }

            var sectionCounts = deckCards
                .GroupBy(dc => dc.WhichDeck)
                .ToDictionary(g => g.Key, g => g.Count());

            var mainDeckCount = sectionCounts.GetValueOrDefault(0, 0);
            var extraDeckCount = sectionCounts.GetValueOrDefault(1, 0);
            var sideDeckCount = sectionCounts.GetValueOrDefault(2, 0);

            var sizeViolations = new List<string>();

            if (mainDeckCount < 40 || mainDeckCount > 60)
            {
                sizeViolations.Add($"Main deck must contain 40-60 cards (current: {mainDeckCount})");
            }

            if (extraDeckCount > 15)
            {
                sizeViolations.Add($"Extra deck cannot exceed 15 cards (current: {extraDeckCount})");
            }

            if (sideDeckCount > 15)
            {
                sizeViolations.Add($"Side deck cannot exceed 15 cards (current: {sideDeckCount})");
            }

            var cardCounts = deckCards
                .GroupBy(c => c.ID_Card)
                .Select(g => new
                {
                    CardId = g.Key,
                    Count = g.Count(),
                    CardName = g.First().Card.Name
                });

            using var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync("https://db.ygoprodeck.com/api/v7/cardinfo.php?banlist=TCG");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode(500, "Failed to fetch banlist data");
            }

            var content = await response.Content.ReadAsStringAsync();
            var banlistData = JsonConvert.DeserializeObject<YgoApiResponse>(content);

            var banViolations = new List<string>();

            var banlistDictionary = banlistData.Data
                .GroupBy(c => c.Name.Trim().ToLower())
                .ToDictionary(
                    g => g.Key,
                    g => g.First().BanlistInfo?.BanTcg?.Trim().ToLower() ?? "unlimited"
                );

            foreach (var card in cardCounts)
            {
                var normalizedCardName = card.CardName.Trim().ToLower();

                if (!banlistDictionary.TryGetValue(normalizedCardName, out var status))
                {
                    continue;
                }

                var allowedCount = status switch
                {
                    "forbidden" => maxForbidden,
                    "limited" => maxLimited,
                    "semi-limited" => maxSemiLimited,
                    _ => maxUnlimited
                };

                if (card.Count > allowedCount)
                {
                    var statusDisplay = status switch
                    {
                        "forbidden" => "Forbidden",
                        "limited" => "Limited",
                        "semi-limited" => "Semi-Limited",
                        _ => "Unlimited"
                    };
                    banViolations.Add($"{card.CardName}: {card.Count} copies (Status: {statusDisplay}, Allowed: {allowedCount})");
                }
            }

            var allViolations = sizeViolations.Concat(banViolations).ToList();

            return Ok(new
            {
                IsValid = !allViolations.Any(),
                TotalCards = deckCards.Count,
                MainDeckCount = mainDeckCount,
                ExtraDeckCount = extraDeckCount,
                SideDeckCount = sideDeckCount,
                Violations = allViolations
            });
        }
    }
}
