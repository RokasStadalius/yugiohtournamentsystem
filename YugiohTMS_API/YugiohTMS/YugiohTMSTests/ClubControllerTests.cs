using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using YugiohTMS.Controllers;
using YugiohTMS.Models;
using YugiohTMS.DTO_Models;
using Microsoft.AspNetCore.Mvc;

namespace YugiohTMS.Tests.Controllers
{
    public class ClubControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;

        public ClubControllerTests()
        {
            // Use InMemory Database for unit testing
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                        .UseInMemoryDatabase(databaseName: "YugiohTMSTestDb")
                        .Options;
        }

        [Fact]
        public async Task GetOwnedClubs_Returns_OkResult_When_Clubs_Exist()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();


            var controller = new ClubController(context);

            var userId = 1;
            context.Club.Add(new Club { ID_Club = 1, Name = "Test Club", ID_Owner = userId, Description = "Description", Location = "Location", Visibility = "Public" });
            context.SaveChanges();

            // Act
            var result = await controller.GetOwnedClubs(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var clubsResponse = Assert.IsType<ClubsResponse>(okResult.Value);
            Assert.Single(clubsResponse.Clubs);
        }

        [Fact]
        public async Task GetClub_Returns_NotFoundResult_When_Club_Does_Not_Exist()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();


            var controller = new ClubController(context);

            // Act
            var result = await controller.GetClub(12312);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateClub_Returns_CreatedAtActionResult_When_Model_Is_Valid()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();


            var controller = new ClubController(context);

            var model = new ClubCreateModel
            {
                Name = "New Club",
                Description = "A new club",
                Location = "Location",
                ID_Owner = 1,
                Visibility = "Public"
            };

            // Act
            var result = await controller.CreateClub(model);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdClub = Assert.IsType<ClubDto>(createdResult.Value);
            Assert.Equal(model.Name, createdClub.Name);
        }

        [Fact]
        public async Task JoinClub_Returns_BadRequest_When_User_Does_Not_Exist()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var controller = new ClubController(context);

            var request = new JoinClubRequest { UserId = 99 };
            var clubId = 1;

            var model = new ClubCreateModel
            {
                Name = "New Club",
                Description = "A new club",
                Location = "Location",
                ID_Owner = 1,
                Visibility = "Public"
            };

            // Act
            await controller.CreateClub(model);

            // Act
            var result = await controller.JoinClub(clubId, request);

            // Assert
            var notFoundResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<JoinResponseDto>(notFoundResult.Value);  // Adjust to match ResponseMessage
            Assert.Equal("Invalid User ID", response.Message);  // Use the Message property
        }

        [Fact]
        public async Task JoinClub_Returns_Conflict_When_User_Is_Already_Member()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();


            var controller = new ClubController(context);

            var club = new Club { ID_Club = 1, Name = "Test Club", ID_Owner = 1, Description = "Description", Location = "Location", Visibility = "Public" };
            var user = new User { ID_User = 1, Username = "Test User", Email = "Email", PasswordHash = "Hash"};
            context.Club.Add(club);
            context.User.Add(user);
            context.ClubMember.Add(new ClubMember { ID_Club = 1, ID_User = 1 });
            context.SaveChanges();

            var request = new JoinClubRequest { UserId = 1 };

            // Act
            var result = await controller.JoinClub(1, request);

            // Assert
            var notFoundResult = Assert.IsType<ConflictObjectResult>(result);
            var response = Assert.IsType<JoinResponseDto>(notFoundResult.Value);  // Adjust to match ResponseMessage
            Assert.Equal("You are already a member of this club.", response.Message);  // Use the Message property
        }

        [Fact]
        public async Task SendInvitation_Returns_BadRequest_When_Club_Is_Not_Private()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            var controller = new ClubController(context);

            // Ensure the required properties are provided
            var club = new Club
            {
                ID_Club = 1,
                Name = "Test Club",
                ID_Owner = 1,
                Description = "Description",
                Location = "Location",
                Visibility = "Public"
            };

            var user = new User
            {
                ID_User = 1,
                Username = "Test User",
                Email = "Email",
                PasswordHash = "Hash"
            };

            context.Club.Add(club);
            context.User.Add(user);
            await context.SaveChangesAsync();  // Use SaveChangesAsync

            var request = new InvitationRequest { CurrentUserId = 1, UserIdToInvite = 2 };

            // Act
            var result = await controller.SendInvitation(1, request);

            // Assert
            var notFoundResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<JoinResponseDto>(notFoundResult.Value);  // Adjust to match ResponseMessage
            Assert.Equal("Invitations can only be sent for private clubs.", response.Message);  // Use the Message property
        }


        [Fact]
        public async Task SendInvitation_Returns_Unauthorized_When_User_Is_Not_Club_Owner()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            var controller = new ClubController(context);

            var club = new Club { ID_Club = 1, Name = "Test Club", ID_Owner = 1, Visibility = "Private", Description = "Description", Location = "Location" };
            var user = new User { ID_User = 2, Username = "Test User", Email = "Email", PasswordHash = "hash" };
            context.Club.Add(club);
            context.User.Add(user);
            context.SaveChanges();

            var request = new InvitationRequest { CurrentUserId = 2, UserIdToInvite = 3 };

            // Act
            var result = await controller.SendInvitation(1, request);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var response = Assert.IsType<JoinResponseDto>(unauthorizedResult.Value);
            Assert.Equal("Only the club owner can send invitations.", response.Message);
        }

        [Fact]
        public async Task GetPublicClubs_Returns_OkResult_When_Clubs_Exist()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            var controller = new ClubController(context);

            // Add a club to the in-memory database
            context.Club.Add(new Club { ID_Club = 1, Name = "Public Club", Visibility = "Public", Description = "Description", Location = "Location" });
            await context.SaveChangesAsync();

            // Act
            var result = controller.GetPublicClubs(); // Ensure to await this async method

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result); // Assert the response is OkObjectResult
            var clubs = Assert.IsType<List<Club>>(okResult.Value); // Assert the value is a List<Club>
            Assert.Single(clubs); // Ensure only one club is returned
        }


    }
}
