using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using YugiohTMS.DTO_Models;
using YugiohTMS.Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForumController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/forum/sections
        [HttpGet("sections")]
        public async Task<ActionResult<IEnumerable<ForumSection>>> GetForumSections()
        {
            var sections = await _context.ForumSection.ToListAsync();
            return Ok(sections);
        }

        // GET: api/forum/posts/{sectionId}
        [HttpGet("posts/{sectionId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetForumPosts(int sectionId)
        {
            if (!_context.ForumSection.Any(s => s.ID_ForumSection == sectionId))
            {
                return NotFound(new { message = "Section not found." });
            }

            var posts = await _context.ForumPost
                .Where(p => p.ID_ForumSection == sectionId)
                .Include(p => p.User)  // Include user details
                .OrderByDescending(p => p.Timestamp) // Order by latest
                .Select(p => new
                {
                    p.ID_ForumPost,
                    p.Title,
                    p.Content,
                    p.ID_User,
                    p.ID_ForumSection,
                    p.Timestamp,
                    User = new
                    {  // Shape the user data
                        p.User.ID_User,
                        p.User.Username
                    }
                })
                .ToListAsync();

            return Ok(posts);
        }

        // GET: api/forum/post/{postId}
        [HttpGet("post/{postId}")]
        public async Task<ActionResult<object>> GetForumPost(int postId)
        {
            var post = await _context.ForumPost
                .Include(p => p.User)
                .Include(p => p.ForumPostComments)
                    .ThenInclude(c => c.User)
                .Where(p => p.ID_ForumPost == postId)
                .Select(p => new
                {
                    p.ID_ForumPost,
                    p.Title,
                    p.Content,
                    p.ID_User,
                    p.ID_ForumSection,
                    p.Timestamp,
                    User = new
                    {
                        p.User.ID_User,
                        p.User.Username
                    },
                    Comments = p.ForumPostComments.OrderByDescending(c => c.Timestamp).Select(c => new
                    {
                        c.ID_ForumPostComment,
                        c.Content,
                        c.ID_User,
                        c.Timestamp,
                        User = new
                        {
                            c.User.ID_User,
                            c.User.Username
                        }
                    })
                })
                .FirstOrDefaultAsync();

            if (post == null)
            {
                return NotFound(new { message = "Post not found." });
            }

            return Ok(post);
        }

        // POST: api/forum/post
        [HttpPost("post")]
        public async Task<ActionResult<ForumPost>> CreateForumPost([FromBody] CreatePostRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (!UserExists(request.ID_User))
            {
                return BadRequest(new { message = "Invalid User Id" });
            }

            var post = new ForumPost
            {
                Title = request.Title,
                Content = request.Content,
                ID_User = request.ID_User,
                ID_ForumSection = request.ID_ForumSection,
                Timestamp = DateTime.UtcNow
            };

            _context.ForumPost.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetForumPost), new { postId = post.ID_ForumPost }, post);
        }

        // POST: api/forum/comment
        [HttpPost("comment")]
        public async Task<ActionResult<ForumPostComment>> CreateForumPostComment([FromBody] CreateCommentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (!UserExists(request.ID_User))
            {
                return BadRequest(new { message = "Invalid User Id" });
            }
            if (!PostExists(request.ID_ForumPost))
            {
                return BadRequest(new { message = "Invalid Post Id" });
            }

            var comment = new ForumPostComment
            {
                Content = request.Content,
                ID_User = request.ID_User,
                ID_ForumPost = request.ID_ForumPost,
                Timestamp = DateTime.UtcNow
            };

            _context.ForumPostComment.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }
        private bool UserExists(int id)
        {
            return _context.User.Any(e => e.ID_User == id);
        }
        private bool PostExists(int id)
        {
            return _context.ForumPost.Any(e => e.ID_ForumPost == id);
        }
    }

}
