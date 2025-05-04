using Microsoft.AspNetCore.Mvc;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClubNewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClubNewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("clubId={clubId}")] // Keep the clubId in the route
        public async Task<ActionResult<NewsDto>> PostNews(int clubId, [FromBody] NewsCreateWithUserIdDto newsDto)
        {
            try
            {
                var user = await _context.User.FindAsync(newsDto.UserId);
                if (user == null)
                {
                    return BadRequest(new { message = "Invalid User ID" });
                }

                var club = await _context.Club.FindAsync(clubId);

                if (club == null)
                {
                    return NotFound(new { message = "Club not found" });
                }

                if (club.ID_Owner != newsDto.UserId)
                {
                    return Forbid(); 
                }

                var news = new ClubNews
                {
                    Content = newsDto.Content,
                    CreatedDate = DateTime.UtcNow,
                    ID_Club = clubId,
                    ID_User = newsDto.UserId,
                };

                _context.ClubNews.Add(news);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(PostNews), new NewsDto
                {
                    ID_ClubNews = news.ID_ClubNews,
                    Content = news.Content,
                    CreatedDate = news.CreatedDate
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔥 Internal error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}