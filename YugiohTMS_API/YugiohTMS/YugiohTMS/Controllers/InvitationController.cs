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

            // 2. Get the current user (the recipient of the invitation)
            int currentUserId = request.UserId;

            // 3. Check if the current user is the recipient of the invitation
            if (invitation.ID_User != currentUserId)
            {
                return Unauthorized(new { message = "You are not authorized to accept this invitation." });
            }

            // 4. Check the current status of the invitation
            if (invitation.Status.ToLower() != "sent")
            {
                return BadRequest(new { message = "Invitation cannot be accepted in its current state." });
            }

            // 5. Update the invitation status to "Accepted"
            invitation.Status = "Accepted";
            _context.Entry(invitation).State = EntityState.Modified;

            // 6. Add the user to the club's members (You might have a separate table for club memberships)
            var membership = new ClubMember
            {
                ID_Club = invitation.ID_Club,
                ID_User = currentUserId,
            };
            _context.ClubMember.Add(membership);

            try
            {
                // 7. Save changes
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Handle database-related errors (e.g., duplicate key violation)
                return BadRequest(new { message = "Failed to accept invitation: " + ex.Message });
            }


            return Ok(new { message = "Invitation accepted successfully." });
        }

        // PUT: api/invitation/{invitationId}/reject
        [HttpPut("{invitationId}/reject")]
        public async Task<IActionResult> RejectInvitation(int invitationId, [FromBody] UserRequest request) // added UserRequest
        {
            // Input Validation
            if (invitationId <= 0)
            {
                return BadRequest(new { message = "Invalid invitation ID." });
            }
            if (request.UserId <= 0)
            {
                return BadRequest(new { message = "Invalid user ID." });
            }

            // 1. Find the invitation
            var invitation = await _context.ClubInvitation.FindAsync(invitationId);
            if (invitation == null)
            {
                return NotFound(new { message = "Invitation not found." });
            }

            // 2. Get the current user
            int currentUserId = request.UserId;


            // 3. Check if the current user is the recipient of the invitation
            if (invitation.ID_User != currentUserId)
            {
                return Unauthorized(new { message = "You are not authorized to reject this invitation." });
            }
            // 4. Check the current status of the invitation
            if (invitation.Status.ToLower() != "sent")
            {
                return BadRequest(new { message = "Invitation cannot be rejected in its current state." });
            }

            // 5. Update the invitation status to "Rejected"
            invitation.Status = "Denied";
            _context.Entry(invitation).State = EntityState.Modified;

            // 6. Save changes
            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation rejected successfully." });
        }


    }
}