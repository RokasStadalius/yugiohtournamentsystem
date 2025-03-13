using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;

namespace YugiohTMS
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> User { get; set; } // Represents the Users table
        public DbSet<Card> Card { get; set; }

        public DbSet<Deck> Deck { get; set; }

        public DbSet<Decklist> Decklist { get; set; }
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

            modelBuilder.Entity<Card>()
           .Property(c => c.Atk)
           .IsRequired(false);  // Nullable for spells/traps
            modelBuilder.Entity<Card>()
                .Property(c => c.Def)
                .IsRequired(false);
        }
    }
}
