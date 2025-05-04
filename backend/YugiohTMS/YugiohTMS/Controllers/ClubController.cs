using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YugiohTMS.DTO_Models;
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
        public async Task<ActionResult<ClubsResponse>> GetOwnedClubs([FromQuery] int userId)
        {
            try
            {
                var clubs = await _context.Club
                    .Where(c => c.ID_Owner == userId)
                    .Select(c => new ClubDto
                    {
                        ID_Club = c.ID_Club,
                        Name = c.Name,
                        Description = c.Description,
                        Location = c.Location,
                        ID_Owner = c.ID_Owner,
                    })
                    .ToListAsync();

                return Ok(new ClubsResponse { Clubs = clubs });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClubDto>> CreateClub([FromBody] ClubCreateModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var club = new Club
                {
                    Name = model.Name,
                    Description = model.Description,
                    Location = model.Location,
                    ID_Owner = model.ID_Owner,
                    Visibility = model.Visibility,
                };

                _context.Club.Add(club);
                await _context.SaveChangesAsync();

                var clubDto = new ClubDto
                {
                    ID_Club = club.ID_Club,
                    Name = club.Name,
                    Description = club.Description,
                    Location = club.Location,
                    ID_Owner = club.ID_Owner,
                    News = new List<NewsDto>(),
                    Visibility = club.Visibility,
                };

                return CreatedAtAction(nameof(GetClub), new { id = club.ID_Club }, clubDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClubDto>> GetClub(int id)
        {
            try
            {
                var club = await _context.Club
                    .Include(c => c.News)  // Include news
                    .FirstOrDefaultAsync(c => c.ID_Club == id);

                if (club == null) return NotFound();

                return Ok(new ClubDto
                {
                    ID_Club = club.ID_Club,
                    Name = club.Name,
                    Description = club.Description,
                    Location = club.Location,
                    ID_Owner = club.ID_Owner,
                    News = club.News.Select(n => new NewsDto
                    {
                        ID_ClubNews = n.ID_ClubNews,
                        Content = n.Content,
                        CreatedDate = n.CreatedDate
                    }).ToList(),
                    Visibility = club.Visibility
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("{clubId}/members")]
        public async Task<ActionResult<IEnumerable<ClubMember>>> GetClubMembers(int clubId)
        {
            var members = await _context.ClubMember
                .Where(cm => cm.ID_Club == clubId)
                .ToListAsync();
            return Ok(members);
        }

        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId, [FromBody] JoinClubRequest request)
        {
            var club = await _context.Club.FindAsync(clubId);
            if (club == null)
            {
                return NotFound(new { message = "Club not found" });
            }

            var user = await _context.User.FindAsync(request.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid User ID" });
            }

            var existingMembership = await _context.ClubMember
                .FirstOrDefaultAsync(cm => cm.ID_Club == clubId && cm.ID_User == request.UserId);

            if (existingMembership != null)
            {
                return Conflict(new { message = "You are already a member of this club." });
            }

            var newMembership = new ClubMember
            {
                ID_Club = clubId,
                ID_User = request.UserId
            };

            _context.ClubMember.Add(newMembership);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully joined the club." });
        }

        [HttpGet("joined")]
        public async Task<ActionResult<IEnumerable<ClubDto>>> GetJoinedClubs([FromQuery] int userId)
        {
            var joinedClubIds = await _context.ClubMember
                .Where(cm => cm.ID_User == userId)
                .Select(cm => cm.ID_Club)
                .ToListAsync();

            var joinedClubs = await _context.Club
                .Where(c => joinedClubIds.Contains(c.ID_Club))
                .Select(c => new ClubDto
                {
                    ID_Club = c.ID_Club,
                    Name = c.Name,
                    Description = c.Description,
                    Location = c.Location,
                    ID_Owner = c.ID_Owner,
                    Visibility = c.Visibility
                })
                .ToListAsync();

            return Ok(joinedClubs);
        }

        [HttpGet("public")]
        public ActionResult<IEnumerable<Club>> GetPublicClubs()
        {
            var publicClubs = _context.Club
                .Where(c => c.Visibility.ToLower() == "public")
                .ToList();

            return Ok(publicClubs);
        }

        [HttpPost("{clubId}/invite")]
        public async Task<IActionResult> SendInvitation(int clubId, [FromBody] InvitationRequest request)
        {
            if (clubId <= 0 || request.UserIdToInvite <= 0 || request.CurrentUserId <= 0)
            {
                return BadRequest(new { message = "Invalid club ID or user ID or current user ID." });
            }

            var club = await _context.Club.FindAsync(clubId);
            if (club == null)
            {
                return NotFound(new { message = "Club not found." });
            }
            if (club.Visibility.ToLower() != "private")
            {
                return BadRequest(new { message = "Invitations can only be sent for private clubs." });
            }

            int currentUserId = request.CurrentUserId;


            if (club.ID_Owner != currentUserId)
            {
                return Unauthorized(new { message = "Only the club owner can send invitations." });
            }

            var userToInvite = await _context.User.FindAsync(request.UserIdToInvite);
            if (userToInvite == null)
            {
                return BadRequest(new { message = "User to invite not found." });
            }

            var existingInvitation = await _context.ClubInvitation.FirstOrDefaultAsync(
                i => i.ID_Club == clubId && i.ID_User == request.UserIdToInvite);

            if (existingInvitation != null)
            {
                if (existingInvitation.Status.ToLower() == "accepted")
                    return BadRequest(new { message = "User is already a member of this club." });
                if (existingInvitation.Status.ToLower() == "sent")
                    return BadRequest(new { message = "Invitation already sent to this user." });
                if (existingInvitation.Status.ToLower() == "denied")
                {
                    existingInvitation.Status = "Sent"; 
                    _context.Entry(existingInvitation).State = EntityState.Modified;
                }
            }
            else
            {
                var invitation = new ClubInvitation
                {
                    ID_Club = clubId,
                    ID_User = request.UserIdToInvite,
                    Status = "Sent" 
                };
                _context.ClubInvitation.Add(invitation);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation sent successfully." });
        }
    }
}
