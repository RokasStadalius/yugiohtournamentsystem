using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YugiohTMS.Controllers;
using YugiohTMS.Models;
using YugiohTMS;

namespace YugiohTMSTests
{
    public class UsersControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "UsersTestDb")
                .Options;

            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _controller = new UsersController(_context);
        }

        [Fact]
        public async Task GetCurrentUser_ReturnsUser_WhenValidId()
        {
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash", Rating = 1200 };
            _context.User.Add(user);
            await _context.SaveChangesAsync();

            var result = await _controller.GetCurrentUser(user.ID_User);

            var okResult = Assert.IsType<ActionResult<User>>(result);
            var returnedUser = Assert.IsType<User>(okResult.Value);
            Assert.Equal(user.ID_User, returnedUser.ID_User);
            Assert.Equal(user.Username, returnedUser.Username);
        }

        [Fact]
        public async Task GetCurrentUser_ReturnsBadRequest_WhenIdIsInvalid()
        {
            var result = await _controller.GetCurrentUser(0);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid user ID.", badRequest.Value);
        }

        [Fact]
        public async Task GetCurrentUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            var result = await _controller.GetCurrentUser(999);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetLeaderboard_ReturnsUsersOrderedByRating()
        {
            var users = new List<User>
        {
            new User { ID_User = 1, Username = "Alice", Email = "Email", PasswordHash = "Hash", Rating = 1500 },
            new User { ID_User = 2, Username = "Bob", Email = "Email", PasswordHash = "Hash", Rating = 1800 },
            new User { ID_User = 3, Username = "Charlie",Email = "Email", PasswordHash = "Hash", Rating = 1600 }
        };
            _context.User.AddRange(users);
            await _context.SaveChangesAsync();

            var result = await _controller.GetLeaderboard();

            var actionResult = Assert.IsType<ActionResult<IEnumerable<User>>>(result);
            var leaderboard = Assert.IsAssignableFrom<IEnumerable<User>>(actionResult.Value);
            var leaderboardList = leaderboard.ToList();

            Assert.Equal(3, leaderboardList.Count);
            Assert.Equal("Bob", leaderboardList[0].Username);
            Assert.Equal("Charlie", leaderboardList[1].Username);
            Assert.Equal("Alice", leaderboardList[2].Username);
        }
    }
}
