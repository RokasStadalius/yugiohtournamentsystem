using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TournamentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TournamentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-tournament")]
        public async Task<IActionResult> CreateTournament([FromBody] Tournament tournament)
        {
            if (string.IsNullOrWhiteSpace(tournament.Name) || string.IsNullOrWhiteSpace(tournament.Type))
            {
                return BadRequest("All fields need to be filled");
            }

            var newTournament = new Tournament
            {
                Name = tournament.Name,
                Type = tournament.Type,
                ID_User = tournament.ID_User
            };

            _context.Tournament.Add(newTournament);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTournamentById), new { id = newTournament.ID_Tournament }, newTournament);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tournament>> GetTournamentById(int id)
        {
            var tournament = await _context.Tournament.FindAsync(id);

            if(tournament == null)
            {
                return NotFound();
            }

            return tournament;
        }

        [HttpGet("user/{ID_User}")]
        public async Task<ActionResult<IEnumerable<Tournament>>> GetUserTournaments(int ID_User)
        {
            var UserExists = await _context.User.AnyAsync(u => u.ID_User == ID_User);

            if(!UserExists) { return NotFound($"User with ID {ID_User} does not exist"); }

            var userTournaments = await _context.Tournament.Where(d => d.ID_User == ID_User).ToListAsync();

            return Ok(userTournaments);
        }

        [HttpGet("all-tournaments")]
        public async Task<ActionResult<IEnumerable<Tournament>>> GetTournaments()
        {
            return await _context.Tournament.ToListAsync();
        }

    }
}
