using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YugiohTMS.Controllers;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;
using YugiohTMS;

namespace YugiohTMSTests
{
    public class ForumControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{System.Guid.NewGuid()}")
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetForumSections_ReturnsAllSections()
        {
            using var context = GetInMemoryDbContext();
            context.ForumSection.Add(new ForumSection { ID_ForumSection = 1, Name = "General", Description = "Description"});
            context.ForumSection.Add(new ForumSection { ID_ForumSection = 2, Name = "Strategy", Description = "Description" });
            await context.SaveChangesAsync();

            var controller = new ForumController(context);

            var result = await controller.GetForumSections();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var sections = Assert.IsAssignableFrom<IEnumerable<ForumSection>>(okResult.Value);
            Assert.Equal(2, sections.Count());
        }

        [Fact]
        public async Task GetForumPosts_ReturnsPostsForSection()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            var section = new ForumSection { ID_ForumSection = 1, Name = "General", Description = "Description" };
            var post = new ForumPost { ID_ForumPost = 1, Title = "Hello", Content = "World", ID_User = 1, ID_ForumSection = 1, Timestamp = System.DateTime.UtcNow, User = user };

            context.User.Add(user);
            context.ForumSection.Add(section);
            context.ForumPost.Add(post);
            await context.SaveChangesAsync();

            var controller = new ForumController(context);
            var result = await controller.GetForumPosts(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var posts = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.Single(posts);
        }

        [Fact]
        public async Task GetForumPosts_ReturnsNotFound_IfSectionDoesNotExist()
        {
            using var context = GetInMemoryDbContext();
            var controller = new ForumController(context);
            var result = await controller.GetForumPosts(999);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Section not found.", notFoundResult.Value.GetType().GetProperty("message")?.GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task GetForumPost_ReturnsPostWithComments()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            var post = new ForumPost
            {
                ID_ForumPost = 1,
                Title = "Sample Post",
                Content = "Sample Content",
                ID_User = 1,
                ID_ForumSection = 1,
                Timestamp = System.DateTime.UtcNow,
                User = user,
                ForumPostComments = new List<ForumPostComment>
            {
                new ForumPostComment { ID_ForumPostComment = 1, Content = "Nice!", ID_User = 1, Timestamp = System.DateTime.UtcNow, User = user }
            }
            };
            context.User.Add(user);
            context.ForumPost.Add(post);
            await context.SaveChangesAsync();

            var controller = new ForumController(context);
            var result = await controller.GetForumPost(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task CreateForumPost_ReturnsCreatedPost()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            await context.SaveChangesAsync();

            var controller = new ForumController(context);
            var request = new CreatePostRequest
            {
                Title = "New Post",
                Content = "Content",
                ID_User = 1,
                ID_ForumSection = 1
            };

            var result = await controller.CreateForumPost(request);
            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            var post = Assert.IsType<ForumPost>(created.Value);
            Assert.Equal("New Post", post.Title);
        }

        [Fact]
        public async Task CreateForumPostComment_ReturnsComment()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            context.ForumPost.Add(new ForumPost { ID_ForumPost = 1, Title = "Sample", Content = "test", ID_User = 1, ID_ForumSection = 1, Timestamp = System.DateTime.UtcNow });
            await context.SaveChangesAsync();

            var controller = new ForumController(context);
            var request = new CreateCommentRequest
            {
                Content = "Nice post",
                ID_User = 1,
                ID_ForumPost = 1
            };

            var result = await controller.CreateForumPostComment(request);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var comment = Assert.IsType<ForumPostComment>(ok.Value);
            Assert.Equal("Nice post", comment.Content);
        }

        [Fact]
        public async Task CreateForumPostComment_InvalidUser_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            var controller = new ForumController(context);
            var request = new CreateCommentRequest
            {
                Content = "Invalid user",
                ID_User = 999,
                ID_ForumPost = 1
            };

            var result = await controller.CreateForumPostComment(request);
            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Invalid User Id", bad.Value.ToString());
        }

        [Fact]
        public async Task CreateForumPostComment_InvalidPost_ReturnsBadRequest()
        {
            using var context = GetInMemoryDbContext();
            var user = new User { ID_User = 1, Username = "TestUser", Email = "Email", PasswordHash = "Hash" };
            context.User.Add(user);
            await context.SaveChangesAsync();

            var controller = new ForumController(context);
            var request = new CreateCommentRequest
            {
                Content = "Invalid post",
                ID_User = 1,
                ID_ForumPost = 999
            };

            var result = await controller.CreateForumPostComment(request);
            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Invalid Post Id", bad.Value.ToString());
        }
    }
}
