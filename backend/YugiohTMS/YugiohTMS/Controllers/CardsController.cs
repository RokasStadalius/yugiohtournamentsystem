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
    private readonly BlobService _blobService;

    public CardsController(ApplicationDbContext dbContext, CardService cardService, BlobService blobService)
    {
        _dbContext = dbContext;
        _cardService = cardService;
        _blobService = blobService;
    }

    [HttpPost("fetch-and-store")]
    public async Task<IActionResult> FetchAndStoreCards()
    {
        var cards = await _cardService.SaveCardsToDatabase(_dbContext, _blobService);
        return Ok(cards);
    }

    [HttpGet("get-cards")]
    public async Task<ActionResult<IEnumerable<Card>>> GetCards()
    {
        return await _dbContext.Card.ToListAsync();
    }
}
