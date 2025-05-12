using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using YugiohTMS.Models;
using Microsoft.AspNetCore.Authorization;
using YugiohTMS.DTO_Models;

namespace YugiohTMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (await _context.User.AnyAsync(u => u.Username == model.Username))
                return BadRequest(new { message = "User with provided username already exists" });

            if (await _context.User.AnyAsync(u => u.Email == model.Email))
                return BadRequest(new { message = "User with provided email address already exists" });

            User user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Rating = 500,
                TournamentsPlayed = 0,
                TournamentsWon = 0
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            string token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "User successfully registered"
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            User? user = await _context.User.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials.");

            string token = GenerateJwtToken(user);

            Response.Cookies.Append("isBanned", user.IsBanned.ToString(), new CookieOptions
            {
                HttpOnly = false,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new LoginResponse
            {
                Token = token,
                IsAdmin = user.IsAdmin,
                UserId = user.ID_User
            });

        }


        private string GenerateJwtToken(User user)
        {
            Claim?[] claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, user.ID_User.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

            SymmetricSecurityKey? key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("isbanned")]
        public async Task<IActionResult> IsBanned()
        {
            Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return BadRequest("Invalid user ID format in token");
            }

            User? user = await _context.User.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user.IsBanned == 1);
        }


        private int GetUserId()
        {
            Claim?claim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new Exception("User ID not found in token");
            return int.Parse(claim.Value);
        }

        [HttpPost("ban-user")]
        public async Task<IActionResult> BanUser([FromBody] BanRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _context.User
                    .FirstOrDefaultAsync(u => u.ID_User == request.ID_User);

                if (user == null)
                {
                    return NotFound(new { Error = "User not found" });
                }

                if (user.IsBanned == 1)
                {
                    return Conflict(new { Error = "User is already banned" });
                }

                user.IsBanned = 1;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Success = true,
                    Message = $"User {request.ID_User} banned successfully",
                    UserId = user.ID_User,
                    IsBanned = user.IsBanned
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Internal server error", Details = ex.Message });
            }
        }
    }
}
