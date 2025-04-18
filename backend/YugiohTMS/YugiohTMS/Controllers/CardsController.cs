using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using YugiohTMS.Models;
using YugiohTMS;
using Microsoft.EntityFrameworkCore;

[Route("api/cards")]
[ApiController]
public class CardsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly CardService _cardService;
    private readonly LocalFileService _fileService;

    public CardsController(ApplicationDbContext dbContext, CardService cardService, LocalFileService fileService)
    {
        _dbContext = dbContext;
        _cardService = cardService;
        _fileService = fileService;
    }

    [HttpPost("fetch-and-store")]
    public async Task<IActionResult> FetchAndStoreCards()
    {
        var cards = await _cardService.SaveCardsToDatabase(_dbContext, _fileService);
        return Ok(cards);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncCards()
    {
        try
        {
            var (newCards, totalProcessed) = await _cardService.SyncCardsWithDatabase(_dbContext, _fileService);
            return Ok(new
            {
                Message = $"Sync completed. Added {newCards.Count} new cards.",
                NewCards = newCards,
                TotalProcessed = totalProcessed
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error syncing cards: {ex.Message}");
        }
    }

    [HttpGet("get-cards")]
    public async Task<ActionResult<IEnumerable<Card>>> GetCards()
    {
        return await _dbContext.Card.ToListAsync();
    }

    [HttpGet("pending-updates")]
    public async Task<IActionResult> GetPendingUpdates()
    {
        try
        {
            var apiCards = await _cardService.FetchCardsFromAPI();
            var existingYgoIds = await _dbContext.Card
                .Select(c => c.ID_YGOPRODECK)
                .ToListAsync();

            var missingCount = apiCards
                .Count(apiCard => !existingYgoIds.Contains(apiCard.ID_YGOPRODECK));

            return Ok(new
            {
                NeedsUpdate = missingCount > 0,
                NewCardsCount = missingCount
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error checking updates: {ex.Message}");
        }
    }
}
