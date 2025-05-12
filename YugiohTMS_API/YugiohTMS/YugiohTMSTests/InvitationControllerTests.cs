using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YourNamespace.Controllers;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;
using YugiohTMS;

namespace YugiohTMSTests
{
    public class InvitationControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{System.Guid.NewGuid()}")
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetUserInvitations_ReturnsInvitations()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "Owner", Email = "Email", PasswordHash = "Hash"};
            var club = new Club { ID_Club = 1, Name = "Duel Club", ID_Owner = 1, Description = "Description", Location = "Location", Visibility = "Private" };
            var invitation = new ClubInvitation { ID_ClubInvitation = 1, ID_User = 2, ID_Club = 1, Status = "Sent", Club = club };
            var invitedUser = new User { ID_User = 2, Username = "Receiver", Email = "Email", PasswordHash = "Hash" };

            context.User.AddRange(user, invitedUser);
            context.Club.Add(club);
            context.ClubInvitation.Add(invitation);
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.GetUserInvitations(new UserRequest { UserId = 2 });

            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.Single(data);
        }

        [Fact]
        public async Task GetUserInvitations_ReturnsEmptyMessage()
        {
            using var context = GetInMemoryDbContext();
            var controller = new InvitationController(context);

            var result = await controller.GetUserInvitations(new UserRequest { UserId = 99 });

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("No invitations", okResult.Value.ToString());
        }

        [Fact]
        public async Task AcceptInvitation_Success()
        {
            using var context = GetInMemoryDbContext();
            var invitation = new ClubInvitation { ID_ClubInvitation = 1, ID_User = 2, ID_Club = 1, Status = "Sent" };
            context.ClubInvitation.Add(invitation);
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.AcceptInvitation(1, new UserRequest { UserId = 2 });

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("accepted successfully", okResult.Value.ToString());

            var member = context.ClubMember.FirstOrDefault(cm => cm.ID_User == 2 && cm.ID_Club == 1);
            Assert.NotNull(member);
        }

        [Fact]
        public async Task AcceptInvitation_InvalidUser_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            var controller = new InvitationController(context);

            var result = await controller.AcceptInvitation(1, new UserRequest { UserId = 0 });
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task AcceptInvitation_NotFound_ReturnsNotFound()
        {
            using var context = GetInMemoryDbContext();
            var controller = new InvitationController(context);

            var result = await controller.AcceptInvitation(99, new UserRequest { UserId = 1 });
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AcceptInvitation_WrongUser_ReturnsUnauthorized()
        {
            using var context = GetInMemoryDbContext();
            context.ClubInvitation.Add(new ClubInvitation { ID_ClubInvitation = 1, ID_User = 5, ID_Club = 1, Status = "Sent" });
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.AcceptInvitation(1, new UserRequest { UserId = 6 });

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task AcceptInvitation_AlreadyAccepted_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            context.ClubInvitation.Add(new ClubInvitation { ID_ClubInvitation = 1, ID_User = 1, ID_Club = 1, Status = "Accepted" });
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.AcceptInvitation(1, new UserRequest { UserId = 1 });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task RejectInvitation_Success()
        {
            using var context = GetInMemoryDbContext();
            context.ClubInvitation.Add(new ClubInvitation { ID_ClubInvitation = 1, ID_User = 1, ID_Club = 1, Status = "Sent" });
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.RejectInvitation(1, new UserRequest { UserId = 1 });

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("rejected successfully", ok.Value.ToString());

            var updated = await context.ClubInvitation.FindAsync(1);
            Assert.Equal("Denied", updated.Status);
        }

        [Fact]
        public async Task RejectInvitation_WrongUser_ReturnsUnauthorized()
        {
            using var context = GetInMemoryDbContext();
            context.ClubInvitation.Add(new ClubInvitation { ID_ClubInvitation = 1, ID_User = 1, ID_Club = 1, Status = "Sent" });
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.RejectInvitation(1, new UserRequest { UserId = 2 });

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task RejectInvitation_AlreadyDenied_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            context.ClubInvitation.Add(new ClubInvitation { ID_ClubInvitation = 1, ID_User = 1, ID_Club = 1, Status = "Denied" });
            await context.SaveChangesAsync();

            var controller = new InvitationController(context);
            var result = await controller.RejectInvitation(1, new UserRequest { UserId = 1 });

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
