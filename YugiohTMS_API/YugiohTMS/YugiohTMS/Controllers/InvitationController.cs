using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;
using YugiohTMS;
using YugiohTMS.DTO_Models;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/invitation")]
    public class InvitationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InvitationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("user")]
        public async Task<IActionResult> GetUserInvitations([FromBody] UserRequest request)
        {
            if (request.UserId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID." });
            }

            int currentUserId = request.UserId;

            var invitations = await _context.ClubInvitation
                .Where(i => i.ID_User == currentUserId)
                .Include(i => i.Club)
                .Select(i => new
                {
                    i.ID_ClubInvitation,
                    i.ID_Club,
                    i.ID_User,
                    i.Status,
                    ClubName = i.Club.Name,
                    OwnerName = _context.User.FirstOrDefault(u => u.ID_User == i.Club.ID_Owner).Username,
                })
                .ToListAsync();

            if (invitations == null || invitations.Count == 0)
            {
                return Ok(new { message = "No invitations found for this user." });
            }

            return Ok(invitations);
        }

        [HttpPut("{invitationId}/accept")]
        public async Task<IActionResult> AcceptInvitation(int invitationId, [FromBody] UserRequest request)
        {
            if (invitationId <= 0)
            {
                return BadRequest(new { message = "Invalid invitation ID." });
            }
            if (request.UserId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID." });
            }

            var invitation = await _context.ClubInvitation.FindAsync(invitationId);
            if (invitation == null)
            {
                return NotFound(new { message = "Invitation not found." });
            }

            int currentUserId = request.UserId;

            if (invitation.ID_User != currentUserId)
            {
                return Unauthorized(new { message = "You are not authorized to accept this invitation." });
            }

            if (invitation.Status.ToLower() != "sent")
            {
                return BadRequest(new { message = "Invitation cannot be accepted in its current state." });
            }

            invitation.Status = "Accepted";
            _context.Entry(invitation).State = EntityState.Modified;

            var membership = new ClubMember
            {
                ID_Club = invitation.ID_Club,
                ID_User = currentUserId,
            };
            _context.ClubMember.Add(membership);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = "Failed to accept invitation: " + ex.Message });
            }


            return Ok(new { message = "Invitation accepted successfully." });
        }

        [HttpPut("{invitationId}/reject")]
        public async Task<IActionResult> RejectInvitation(int invitationId, [FromBody] UserRequest request)
        {
            if (invitationId <= 0)
            {
                return BadRequest(new { message = "Invalid invitation ID." });
            }
            if (request.UserId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID." });
            }

            var invitation = await _context.ClubInvitation.FindAsync(invitationId);
            if (invitation == null)
            {
                return NotFound(new { message = "Invitation not found." });
            }

            int currentUserId = request.UserId;


            if (invitation.ID_User != currentUserId)
            {
                return Unauthorized(new { message = "You are not authorized to reject this invitation." });
            }
            if (invitation.Status.ToLower() != "sent")
            {
                return BadRequest(new { message = "Invitation cannot be rejected in its current state." });
            }

            invitation.Status = "Denied";
            _context.Entry(invitation).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation rejected successfully." });
        }


    }
}