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

        public DbSet<ClubNews> ClubNews { get; set; }

        public DbSet<ClubMember> ClubMember { get; set; }

        public DbSet<ClubInvitation> ClubInvitation { get; set; }

        public DbSet<ForumSection> ForumSection { get; set; }
        public DbSet<ForumPost> ForumPost { get; set; }
        public DbSet<ForumPostComment> ForumPostComment { get; set; }

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

            modelBuilder.Entity<Club>()
            .HasOne(c => c.Owner)
            .WithMany()
            .HasForeignKey(c => c.ID_Owner)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClubNews>()
                .HasOne(n => n.Club)
                .WithMany(c => c.News)
                .HasForeignKey(n => n.ID_Club);

            modelBuilder.Entity<ClubNews>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.ID_User);

            modelBuilder.Entity<ClubInvitation>()
                .HasOne(ci => ci.Club)
                .WithMany()
                .HasForeignKey(ci => ci.ID_Club);

            modelBuilder.Entity<ForumPost>()
                .HasOne(fp => fp.User)
                .WithMany()
                .HasForeignKey(fp => fp.ID_User);

            modelBuilder.Entity<ForumPost>()
                .HasOne(fp => fp.ForumSection)
                .WithMany(fs => fs.ForumPosts)
                .HasForeignKey(fp => fp.ID_ForumSection);

            modelBuilder.Entity<ForumPostComment>()
                .HasOne(fpc => fpc.User)
                .WithMany()
                .HasForeignKey(fpc => fpc.ID_User);

            modelBuilder.Entity<ForumPostComment>()
                .HasOne(fpc => fpc.ForumPost)
                .WithMany(fp => fp.ForumPostComments)
                .HasForeignKey(fpc => fpc.ID_ForumPost);
        }




    }




}
