using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Singer> Singers => Set<Singer>();
    public DbSet<Song> Songs => Set<Song>();
    public DbSet<SingerSong> SingerSongs => Set<SingerSong>();

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
    }
}
