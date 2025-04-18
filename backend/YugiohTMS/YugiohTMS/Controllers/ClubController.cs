using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]


    public class ClubController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClubController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("owned")]
        public async Task<ActionResult<IEnumerable<Club>>> GetOwnedClubs([FromQuery] int userId)
        {
            try
            {
                var clubs = await _context.Club
                    .Where(c => c.ID_Owner == userId)
                    .ToListAsync();

                return Ok(clubs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Club>> CreateClub([FromBody] ClubCreateModel model)
        {
            try
            {
                var club = new Club
                {
                    Name = model.Name,
                    Description = model.Description,
                    Location = model.Location,
                    ID_Owner = model.ID_Owner
                };

                _context.Club.Add(club);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetClub), new { id = club.ID_Club }, club);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Club>> GetClub(int id)
        {
            var club = await _context.Club.FindAsync(id);
            if (club == null) return NotFound();
            return club;
        }
    }
}
