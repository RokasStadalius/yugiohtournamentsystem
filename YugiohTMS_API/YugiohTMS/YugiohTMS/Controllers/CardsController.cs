using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using YugiohTMS.Models;
using YugiohTMS;
using Microsoft.EntityFrameworkCore;
using YugiohTMS.DTO_Models;

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

            var response = new SyncResponseDto
            {
                Message = $"Sync completed. Added {newCards.Count} new cards.",
                NewCards = newCards,
                TotalProcessed = totalProcessed
            };


            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error syncing cards: {ex.Message}");
        }
    }

    [HttpGet("get-cards")]
    public async Task<ActionResult<IEnumerable<Card>>> GetCards()
    {
        var cards = await _dbContext.Card.ToListAsync();
        return Ok(cards);
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

            return Ok(new UpdateStatusDto
            {
                NeedsUpdate = false,
                NewCardsCount = 0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error checking updates: {ex.Message}");
        }
    }
}
