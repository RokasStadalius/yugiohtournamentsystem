using Microsoft.EntityFrameworkCore;
using YugiohTMS.Models;

namespace YugiohTMS
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> User { get; set; }
        public DbSet<Card> Card { get; set; }

        public DbSet<Deck> Deck { get; set; }

        public DbSet<Decklist> Decklist { get; set; }

        public DbSet<Tournament> Tournament { get; set; }

        public DbSet<TournamentPlayer> TournamentPlayer { get; set; }

        public DbSet<Match> Match { get; set; }

        public DbSet<Club> Club { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });

            modelBuilder.Entity<Card>()
           .Property(c => c.Atk)
           .IsRequired(false); 
            modelBuilder.Entity<Card>()
                .Property(c => c.Def)
                .IsRequired(false);

            modelBuilder.Entity<Tournament>()
       .HasOne(t => t.Winner)
       .WithMany()
       .HasForeignKey(t => t.ID_Winner)
       .IsRequired(false);
        }


    }
}
