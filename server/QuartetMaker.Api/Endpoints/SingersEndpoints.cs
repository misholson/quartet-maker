using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class SingersEndpoints
{
    public static IEndpointRouteBuilder MapSingersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/singers").WithTags("Singers").RequireAuthorization();

        group.MapGet("/", async (AppDbContext db) =>
        {
            var singers = await db.Singers
                .Select(s => new SingerSummaryDto(s.Id, s.Nickname ?? s.Name, s.SingerSongs.Count))
                .ToListAsync();
            return Results.Ok(singers);
        })
        .WithName("GetSingers");

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var singer = await db.Singers
                .Include(s => s.SingerSongs)
                .ThenInclude(ss => ss.Song)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (singer is null) return Results.NotFound();

            var dto = new SingerDto(
                singer.Id,
                singer.Nickname ?? singer.Name,
                singer.Nickname,
                singer.PreferredPart,
                singer.SingerSongs.Select(ss => new RepertoireEntryDto(ss.SongId, ss.Song.Title, ss.Part, ss.Song.Arranger, ss.Song.Voicing)));

            return Results.Ok(dto);
        })
        .WithName("GetSinger");

        group.MapPost("/{id:int}/songs", async (int id, AddSongRequest req, AppDbContext db) =>
        {
            if (await db.Singers.FindAsync(id) is null) return Results.NotFound();

            var song = await db.Songs.FirstOrDefaultAsync(s => s.Title == req.SongTitle)
                       ?? db.Songs.Add(new Song { Title = req.SongTitle, Arranger = req.Arranger, Voicing = req.Voicing }).Entity;

            await db.SaveChangesAsync();

            var exists = await db.SingerSongs.AnyAsync(ss =>
                ss.SingerId == id && ss.SongId == song.Id && ss.Part == req.Part);
            if (exists) return Results.Conflict();

            db.SingerSongs.Add(new SingerSong { SingerId = id, SongId = song.Id, Part = req.Part });
            await db.SaveChangesAsync();

            return Results.Created(
                $"/api/singers/{id}",
                new RepertoireEntryDto(song.Id, song.Title, req.Part, song.Arranger, song.Voicing));
        })
        .WithName("AddSong");

        group.MapPut("/preferred-part", async (SetPreferredPartRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var singer = await db.Singers.FindAsync(singerId);
            if (singer is null) return Results.NotFound();
            singer.PreferredPart = req.Part;
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("SetPreferredPart");

        group.MapPut("/nickname", async (SetNicknameRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var singer = await db.Singers.FindAsync(singerId);
            if (singer is null) return Results.NotFound();
            singer.Nickname = string.IsNullOrWhiteSpace(req.Nickname) ? null : req.Nickname.Trim();
            await db.SaveChangesAsync();
            return Results.Ok(singer.Nickname);
        })
        .WithName("SetNickname");

        group.MapDelete("/{id:int}/songs/{songId:int}/{part}", async (int id, int songId, Part part, AppDbContext db) =>
        {
            var entry = await db.SingerSongs.FindAsync(id, songId, part);
            if (entry is null) return Results.NotFound();

            db.SingerSongs.Remove(entry);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("RemoveSong");

        return app;
    }
}
