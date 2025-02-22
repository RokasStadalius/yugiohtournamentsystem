using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;

namespace YugiohTMS
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> User { get; set; } // Represents the Users table

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the User entity (if needed)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique(); // Ensure email is unique
            });
        }
    }
}
