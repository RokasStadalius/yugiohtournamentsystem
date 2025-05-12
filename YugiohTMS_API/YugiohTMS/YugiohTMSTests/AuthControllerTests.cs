using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using YugiohTMS.Controllers;
using YugiohTMS.Models;
using YugiohTMS.DTO_Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace YugiohTMS.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IConfiguration> _mockConfig;

        public AuthControllerTests()
        {
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(c => c["Jwt:SecretKey"]).Returns("supersecretkey1234567890!@#$%^&*()");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("testissuer");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("testaudience");
        }

        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_IfUsernameExists()
        {
            var dbContext = GetInMemoryDbContext();
            dbContext.User.Add(new User
            {
                Username = "testuser",
                Email = "test@email.com",
                PasswordHash = "hash",
                IsAdmin = 0,
                IsBanned = 0,
                Rating = 500,
                TournamentsPlayed = 1,
                TournamentsWon = 0
            });
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);

            var model = new RegisterModel
            {
                Username = "testuser",
                Email = "new@email.com",
                Password = "password123"
            };

            var result = await controller.Register(model);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_ShouldReturnOk_IfNewUser()
        {
            var dbContext = GetInMemoryDbContext();
            var controller = new AuthController(dbContext, _mockConfig.Object);

            var model = new RegisterModel
            {
                Username = "newuser",
                Email = "new@email.com",
                Password = "password123"
            };

            var result = await controller.Register(model);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value;

            Assert.NotNull(value);

            var message = value?.GetType().GetProperty("message")?.GetValue(value, null) as string;
            Assert.Equal("User successfully registered", message);

        }

        [Fact]
        public async Task Login_ShouldReturnUnauthorized_IfCredentialsInvalid()
        {
            var dbContext = GetInMemoryDbContext();
            var controller = new AuthController(dbContext, _mockConfig.Object);

            var model = new LoginModel
            {
                Email = "notfound@email.com",
                Password = "wrongpass"
            };

            var result = await controller.Login(model);
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_ShouldReturnOk_IfCredentialsValid()
        {
            var dbContext = GetInMemoryDbContext();
            var password = "password123";
            var hashed = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                ID_User = 1,
                Username = "testuser",
                Email = "test@email.com",
                PasswordHash = hashed,
                IsAdmin = 1,
                IsBanned = 0,
                Rating = 600,
                TournamentsPlayed = 2,
                TournamentsWon = 1
            };
            dbContext.User.Add(user);
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);

            var mockResponseCookies = new Mock<IResponseCookies>();
            var mockResponse = new Mock<HttpResponse>();
            mockResponse.Setup(r => r.Cookies).Returns(mockResponseCookies.Object);

            var mockContext = new Mock<HttpContext>();
            mockContext.Setup(c => c.Response).Returns(mockResponse.Object);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = mockContext.Object
            };

            var model = new LoginModel
            {
                Email = "test@email.com",
                Password = password
            };

            var result = await controller.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            mockResponseCookies.Verify(
                 c => c.Append(
                It.Is<string>(s => s == "token"),
                It.IsAny<string>(),
                It.IsAny<CookieOptions>()
            ),
            Times.Once
);

        }


        [Fact]
        public async Task BanUser_ShouldReturnNotFound_IfUserNotExist()
        {
            var dbContext = GetInMemoryDbContext();
            var controller = new AuthController(dbContext, _mockConfig.Object);

            var result = await controller.BanUser(new BanRequest { ID_User = 99 });
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task BanUser_ShouldReturnConflict_IfAlreadyBanned()
        {
            var dbContext = GetInMemoryDbContext();
            dbContext.User.Add(new User
            {
                ID_User = 1,
                Username = "banneduser",
                Email = "banned@email.com",
                PasswordHash = "hash",
                IsBanned = 1,
                IsAdmin = 0,
                Rating = 500,
                TournamentsPlayed = 2,
                TournamentsWon = 1
            });
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);

            var result = await controller.BanUser(new BanRequest { ID_User = 1 });
            Assert.IsType<ConflictObjectResult>(result);
        }

        [Fact]
        public async Task BanUser_ShouldBanUser_IfValid()
        {
            var dbContext = GetInMemoryDbContext();
            dbContext.User.Add(new User
            {
                ID_User = 2,
                Username = "normaluser",
                Email = "user@email.com",
                PasswordHash = "hash",
                IsBanned = 0,
                IsAdmin = 0,
                Rating = 500,
                TournamentsPlayed = 1,
                TournamentsWon = 0
            });
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);

            var result = await controller.BanUser(new BanRequest { ID_User = 2 });

            var ok = Assert.IsType<OkObjectResult>(result);
            var user = dbContext.User.First(u => u.ID_User == 2);
            Assert.Equal(1, user.IsBanned);
        }

        [Fact]
        public async Task IsBanned_ShouldReturnTrue_IfUserIsBanned()
        {
            var dbContext = GetInMemoryDbContext();
            var user = new User
            {
                ID_User = 3,
                Username = "banned",
                Email = "banned@user.com",
                PasswordHash = "hash",
                IsBanned = 1,
                IsAdmin = 0,
                Rating = 450,
                TournamentsPlayed = 3,
                TournamentsWon = 0
            };
            dbContext.User.Add(user);
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID_User.ToString())
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = await controller.IsBanned();
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.True((bool)ok.Value);
        }

        [Fact]
        public async Task IsBanned_ShouldReturnFalse_IfUserNotBanned()
        {
            var dbContext = GetInMemoryDbContext();
            var user = new User
            {
                ID_User = 4,
                Username = "notbanned",
                Email = "ok@user.com",
                PasswordHash = "hash",
                IsBanned = 0,
                IsAdmin = 0,
                Rating = 600,
                TournamentsPlayed = 5,
                TournamentsWon = 2
            };
            dbContext.User.Add(user);
            dbContext.SaveChanges();

            var controller = new AuthController(dbContext, _mockConfig.Object);
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID_User.ToString())
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var result = await controller.IsBanned();
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.False((bool)ok.Value);
        }
    }
}
