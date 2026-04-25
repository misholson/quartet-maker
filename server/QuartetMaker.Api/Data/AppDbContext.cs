using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Singer> Singers => Set<Singer>();
    public DbSet<Song> Songs => Set<Song>();
    public DbSet<SingerSong> SingerSongs => Set<SingerSong>();
    public DbSet<Quartet> Quartets => Set<Quartet>();
    public DbSet<QuartetMember> QuartetMembers => Set<QuartetMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SingerSong>()
            .HasKey(ss => new { ss.SingerId, ss.SongId, ss.Part });

        modelBuilder.Entity<SingerSong>()
            .HasOne(ss => ss.Singer)
            .WithMany(s => s.SingerSongs)
            .HasForeignKey(ss => ss.SingerId);

        modelBuilder.Entity<SingerSong>()
            .HasOne(ss => ss.Song)
            .WithMany(s => s.SingerSongs)
            .HasForeignKey(ss => ss.SongId);

        modelBuilder.Entity<Singer>()
            .HasIndex(s => s.GoogleId)
            .IsUnique()
            .HasFilter("[GoogleId] IS NOT NULL");

        modelBuilder.Entity<Song>()
            .HasIndex(s => s.Title)
            .IsUnique();

        modelBuilder.Entity<Song>()
            .Property(s => s.Voicing)
            .HasConversion<string>();

        modelBuilder.Entity<SingerSong>()
            .Property(ss => ss.Part)
            .HasConversion<string>();

        modelBuilder.Entity<QuartetMember>()
            .HasKey(qm => new { qm.QuartetId, qm.SingerId });

        modelBuilder.Entity<QuartetMember>()
            .HasOne(qm => qm.Quartet)
            .WithMany(q => q.Members)
            .HasForeignKey(qm => qm.QuartetId);

        modelBuilder.Entity<QuartetMember>()
            .HasOne(qm => qm.Singer)
            .WithMany()
            .HasForeignKey(qm => qm.SingerId);

        modelBuilder.Entity<Quartet>()
            .HasIndex(q => q.InviteCode)
            .IsUnique();
    }
}
