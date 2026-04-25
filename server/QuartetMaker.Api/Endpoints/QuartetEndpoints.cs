using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class QuartetEndpoints
{
    public static IEndpointRouteBuilder MapQuartetEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/quartets", async (
            CreateQuartetRequest req,
            ClaimsPrincipal user,
            AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var singer = await db.Singers.FindAsync(singerId);
            if (singer is null) return Results.Unauthorized();

            var quartet = new Quartet
            {
                Name = req.Name,
                InviteCode = Guid.NewGuid().ToString("N")[..10],
                Members = [new QuartetMember { SingerId = singerId, IsOwner = true }],
            };
            db.Quartets.Add(quartet);
            await db.SaveChangesAsync();

            return Results.Created($"/api/quartets/{quartet.Id}", new QuartetDto(
                quartet.Id, quartet.Name, quartet.InviteCode,
                [new QuartetMemberDto(singerId, singer.Name, true)]));
        })
        .WithTags("Quartet").WithName("CreateQuartet").RequireAuthorization();

        app.MapGet("/api/quartets/my", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartets = await db.Quartets
                .Where(q => q.Members.Any(qm => qm.SingerId == singerId))
                .Select(q => new QuartetSummaryDto(q.Id, q.Name, q.Members.Count))
                .ToListAsync();
            return Results.Ok(quartets);
        })
        .WithTags("Quartet").WithName("GetMyQuartets").RequireAuthorization();

        app.MapGet("/api/quartets/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets
                .Include(q => q.Members).ThenInclude(qm => qm.Singer)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (quartet is null) return Results.NotFound();
            if (!quartet.Members.Any(qm => qm.SingerId == singerId)) return Results.Forbid();
            return Results.Ok(ToDto(quartet));
        })
        .WithTags("Quartet").WithName("GetQuartet").RequireAuthorization();

        app.MapPost("/api/quartets/join/{inviteCode}", async (
            string inviteCode,
            ClaimsPrincipal user,
            AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets.FirstOrDefaultAsync(q => q.InviteCode == inviteCode);
            if (quartet is null) return Results.NotFound("Invalid invite code.");

            // INSERT OR IGNORE is atomic — safe against concurrent duplicate requests
            await db.Database.ExecuteSqlAsync(
                $"INSERT OR IGNORE INTO QuartetMembers (QuartetId, SingerId, IsOwner) VALUES ({quartet.Id}, {singerId}, 0)");

            var members = await db.QuartetMembers
                .Where(qm => qm.QuartetId == quartet.Id)
                .Join(db.Singers, qm => qm.SingerId, s => s.Id,
                      (qm, s) => new QuartetMemberDto(qm.SingerId, s.Name, qm.IsOwner))
                .ToListAsync();

            return Results.Ok(new QuartetDto(quartet.Id, quartet.Name, quartet.InviteCode, members));
        })
        .WithTags("Quartet").WithName("JoinQuartet").RequireAuthorization();

        app.MapGet("/api/quartets/{id:int}/songs", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var quartet = await db.Quartets
                .Include(q => q.Members)
                .FirstOrDefaultAsync(q => q.Id == id);
            if (quartet is null) return Results.NotFound();
            if (!quartet.Members.Any(qm => qm.SingerId == singerId)) return Results.Forbid();

            var singerIds = quartet.Members.Select(qm => qm.SingerId).ToArray();
            var entries = await db.SingerSongs
                .Where(ss => singerIds.Contains(ss.SingerId))
                .Include(ss => ss.Song)
                .Include(ss => ss.Singer)
                .ToListAsync();

            var songs = entries
                .GroupBy(ss => ss.Song.Title)
                .Select(g =>
                {
                    var tenor    = g.Where(ss => ss.Part == Part.Tenor).Select(ss => ss.Singer.Name).ToList();
                    var lead     = g.Where(ss => ss.Part == Part.Lead).Select(ss => ss.Singer.Name).ToList();
                    var baritone = g.Where(ss => ss.Part == Part.Baritone).Select(ss => ss.Singer.Name).ToList();
                    var bass     = g.Where(ss => ss.Part == Part.Bass).Select(ss => ss.Singer.Name).ToList();
                    var song     = g.First().Song;
                    return new QuartetSongDto(
                        g.Key, song.Arranger, song.Voicing,
                        new PartCoverageDto(tenor, lead, baritone, bass),
                        tenor.Count > 0 && lead.Count > 0 && baritone.Count > 0 && bass.Count > 0);
                })
                .OrderByDescending(s => s.IsComplete)
                .ThenBy(s => s.Title)
                .ToList();

            return Results.Ok(songs);
        })
        .WithTags("Quartet").WithName("GetQuartetSongCoverage").RequireAuthorization();

        return app;
    }

    private static int GetSingerId(ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static QuartetDto ToDto(Quartet quartet) =>
        new(quartet.Id, quartet.Name, quartet.InviteCode,
            quartet.Members.Select(qm => new QuartetMemberDto(qm.SingerId, qm.Singer.Name, qm.IsOwner)));
}
