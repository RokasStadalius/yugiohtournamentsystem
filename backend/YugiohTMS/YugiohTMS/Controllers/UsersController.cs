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
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("me")]
        public async Task<ActionResult<User>> GetCurrentUser([FromBody] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("Invalid user ID.");
            }

            var user = await _context.User.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpGet("leaderboard")]
        public async Task<ActionResult<IEnumerable<User>>> GetLeaderboard()
        {
            var leaderboard = await _context.User
                .OrderByDescending(u => u.Rating)
                .ToListAsync();

            return leaderboard;
        }
    }
}
