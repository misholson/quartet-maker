using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Data;

public static class Seeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.Singers.AnyAsync())
            await SeedSingersAsync(db);

        if (!await db.Collections.AnyAsync())
            await SeedCollectionsAsync(db);
    }

    private static async Task SeedSingersAsync(AppDbContext db)
    {
        var singers = new Singer[]
        {
            new() { Id = 1, Name = "Seed" }
        };

        var songs = new Song[]
        {
            new() { Id = 1, Title = "Hello My Baby",     Arranger = "Howard Emerson Brooks", Voicing = Voicing.TTBB }
        };

        var singerSongs = new SingerSong[]
        {
            new() { SingerId = 1, SongId = 1, Part = Part.Tenor }
        };

        db.Singers.AddRange(singers);
        db.Songs.AddRange(songs);
        db.SingerSongs.AddRange(singerSongs);
        await db.SaveChangesAsync();
    }

    private static async Task SeedCollectionsAsync(AppDbContext db)
    {
        var csvDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "Seeds", "Collections");
        if (!Directory.Exists(csvDir)) return;

        foreach (var csvPath in Directory.EnumerateFiles(csvDir, "*.csv"))
        {
            var collectionName = Path.GetFileNameWithoutExtension(csvPath);
            var lines = await File.ReadAllLinesAsync(csvPath);

            var collection = new Collection
            {
                Name = collectionName,
                CreatedById = 1,
            };
            db.Collections.Add(collection);
            await db.SaveChangesAsync();

            foreach (var line in lines.Skip(1)) // skip header
            {
                var (title, arranger, voicing) = ParseCsvRow(line);
                if (string.IsNullOrWhiteSpace(title)) continue;

                var song = await db.Songs.FirstOrDefaultAsync(s => s.Title == title);
                if (song is null)
                {
                    song = new Song { Title = title, Arranger = arranger, Voicing = voicing };
                    db.Songs.Add(song);
                    await db.SaveChangesAsync();
                }

                db.CollectionSongs.Add(new CollectionSong { CollectionId = collection.Id, SongId = song.Id });
            }

            await db.SaveChangesAsync();
        }
    }

    private static (string title, string? arranger, Voicing? voicing) ParseCsvRow(string line)
    {
        var fields = SplitCsvLine(line);
        if (fields.Count < 1) return (string.Empty, null, null);

        var title = fields[0];
        var arranger = fields.Count > 1 ? NullIfEmpty(fields[1]) : null;
        Voicing? voicing = null;
        if (fields.Count > 2 && Enum.TryParse<Voicing>(fields[2], out var v))
            voicing = v;

        return (title, arranger, voicing);
    }

    private static List<string> SplitCsvLine(string line)
    {
        var fields = new List<string>();
        var i = 0;
        while (i < line.Length)
        {
            if (line[i] == '"')
            {
                i++; // skip opening quote
                var sb = new System.Text.StringBuilder();
                while (i < line.Length)
                {
                    if (line[i] == '"' && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        sb.Append('"');
                        i += 2;
                    }
                    else if (line[i] == '"')
                    {
                        i++; // skip closing quote
                        break;
                    }
                    else
                    {
                        sb.Append(line[i++]);
                    }
                }
                fields.Add(sb.ToString());
                if (i < line.Length && line[i] == ',') i++;
            }
            else
            {
                var end = line.IndexOf(',', i);
                if (end == -1)
                {
                    fields.Add(line[i..]);
                    break;
                }
                fields.Add(line[i..end]);
                i = end + 1;
            }
        }
        return fields;
    }

    private static string? NullIfEmpty(string s) =>
        string.IsNullOrWhiteSpace(s) ? null : s;
}
