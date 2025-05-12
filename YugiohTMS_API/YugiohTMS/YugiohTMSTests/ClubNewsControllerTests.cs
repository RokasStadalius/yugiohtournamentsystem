using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;
using YugiohTMS;
using YugiohTMS.Controllers;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;

namespace YugiohTMS.Tests.Controllers
{
    public class ClubNewsControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task PostNews_ShouldReturnCreated_WhenValidRequest()
        {
            // Arrange
            var context = GetInMemoryDbContext();

            var user = new User { ID_User = 1, Username = "owner", Email = "Email", PasswordHash = "Hash" };
            var club = new Club { ID_Club = 1, Name = "Test Club", ID_Owner = 1, Description = "Description", Location = "Location", Visibility =  "Public" };

            context.User.Add(user);
            context.Club.Add(club);
            await context.SaveChangesAsync();

            var controller = new ClubNewsController(context);

            var dto = new NewsCreateWithUserIdDto
            {
                UserId = 1,
                Content = "Club announcement"
            };

            // Act
            var result = await controller.PostNews(1, dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnedDto = Assert.IsType<NewsDto>(createdResult.Value);
            Assert.Equal(dto.Content, returnedDto.Content);
            Assert.Equal(1, context.ClubNews.CountAsync().Result);
        }

        [Fact]
        public async Task PostNews_ShouldReturnBadRequest_WhenUserNotFound()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var club = new Club { ID_Club = 1, Name = "Test Club", ID_Owner = 1, Description = "Description", Location = "Location", Visibility = "Public" };

            context.Club.Add(club);
            await context.SaveChangesAsync();

            var controller = new ClubNewsController(context);

            var dto = new NewsCreateWithUserIdDto
            {
                UserId = 99,  // Invalid user
                Content = "Test content"
            };

            // Act
            var result = await controller.PostNews(1, dto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        [Fact]
        public async Task PostNews_ShouldReturnNotFound_WhenClubNotFound()
        {
            var user = new User { ID_User = 1, Username = "owner", Email = "Email", PasswordHash = "Hash" };
            var context = GetInMemoryDbContext();

            context.User.Add(user);
            await context.SaveChangesAsync();

            var controller = new ClubNewsController(context);

            var dto = new NewsCreateWithUserIdDto
            {
                UserId = 1,
                Content = "News"
            };

            // Act
            var result = await controller.PostNews(999, dto);  // Invalid club ID

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal(404, notFound.StatusCode);
        }

        [Fact]
        public async Task PostNews_ShouldReturnForbid_WhenUserIsNotClubOwner()
        {
            var user = new User { ID_User = 1, Username = "owner", Email = "Email", PasswordHash = "Hash" };
            var club = new Club { ID_Club = 1, Name = "Test Club", ID_Owner = 1, Description = "Description", Location = "Location", Visibility = "Public" };
            var context = GetInMemoryDbContext();

            context.User.Add(user);
            context.Club.Add(club);
            await context.SaveChangesAsync();

            var controller = new ClubNewsController(context);

            var dto = new NewsCreateWithUserIdDto
            {
                UserId = 2,
                Content = "Unauthorized attempt"
            };

            // Act
            var result = await controller.PostNews(1, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }
    }

}
