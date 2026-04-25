using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Data;

public static class Seeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Singers.AnyAsync()) return;

        var singers = new Singer[]
        {
            new() { Id = 1, Name = "Mike" },
            new() { Id = 2, Name = "Alice" },
            new() { Id = 3, Name = "Bob" },
            new() { Id = 4, Name = "Carol" },
            new() { Id = 5, Name = "Dave" },
        };

        var songs = new Song[]
        {
            new() { Id = 1, Title = "Sweet Adeline",    Arranger = "Harry Armstrong",       Voicing = Voicing.TTBB },
            new() { Id = 2, Title = "Hello My Baby",    Arranger = "Howard Emerson Brooks", Voicing = Voicing.TTBB },
            new() { Id = 3, Title = "Down Our Way",     Arranger = null,                    Voicing = Voicing.TTBB },
            new() { Id = 4, Title = "Coney Island Baby",Arranger = "Jim Clancy",            Voicing = Voicing.TTBB },
            new() { Id = 5, Title = "Lida Rose",        Arranger = "Meredith Willson",      Voicing = Voicing.SSAA },
        };

        var singerSongs = new SingerSong[]
        {
            // Mike — Tenor
            new() { SingerId = 1, SongId = 1, Part = Part.Tenor },
            new() { SingerId = 1, SongId = 2, Part = Part.Tenor },
            new() { SingerId = 1, SongId = 3, Part = Part.Tenor },
            new() { SingerId = 1, SongId = 4, Part = Part.Tenor },
            // Alice — Lead
            new() { SingerId = 2, SongId = 1, Part = Part.Lead },
            new() { SingerId = 2, SongId = 2, Part = Part.Lead },
            new() { SingerId = 2, SongId = 4, Part = Part.Lead },
            // Bob — Baritone
            new() { SingerId = 3, SongId = 1, Part = Part.Baritone },
            new() { SingerId = 3, SongId = 2, Part = Part.Baritone },
            new() { SingerId = 3, SongId = 3, Part = Part.Baritone },
            new() { SingerId = 3, SongId = 4, Part = Part.Baritone },
            // Carol — Bass
            new() { SingerId = 4, SongId = 1, Part = Part.Bass },
            new() { SingerId = 4, SongId = 2, Part = Part.Bass },
            new() { SingerId = 4, SongId = 3, Part = Part.Bass },
            new() { SingerId = 4, SongId = 4, Part = Part.Bass },
            // Dave — Lead
            new() { SingerId = 5, SongId = 3, Part = Part.Lead },
            new() { SingerId = 5, SongId = 5, Part = Part.Lead },
        };

        db.Singers.AddRange(singers);
        db.Songs.AddRange(songs);
        db.SingerSongs.AddRange(singerSongs);
        await db.SaveChangesAsync();
    }
}
