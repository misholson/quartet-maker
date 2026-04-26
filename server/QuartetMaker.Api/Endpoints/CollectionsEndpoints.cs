using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class CollectionsEndpoints
{
    public static IEndpointRouteBuilder MapCollectionsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/collections").WithTags("Collections").RequireAuthorization();

        group.MapGet("/", async (string? search, AppDbContext db) =>
        {
            var query = db.Collections.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Name.ToLower().Contains(search.ToLower()));

            var collections = await query
                .OrderBy(c => c.Name)
                .Select(c => new CollectionSummaryDto(
                    c.Id, c.Name, c.Description, c.CreatedBy.Name, c.CreatedById,
                    c.CollectionSongs.Count))
                .ToListAsync();
            return Results.Ok(collections);
        })
        .WithName("GetCollections");

        group.MapPost("/", async (CreateCollectionRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var singer = await db.Singers.FindAsync(singerId);
            if (singer is null) return Results.Unauthorized();

            var collection = new Collection
            {
                Name = req.Name,
                Description = req.Description,
                CreatedById = singerId,
            };
            db.Collections.Add(collection);
            await db.SaveChangesAsync();

            return Results.Created($"/api/collections/{collection.Id}",
                new CollectionDto(collection.Id, collection.Name, collection.Description,
                    singer.Name, singerId, []));
        })
        .WithName("CreateCollection");

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var collection = await db.Collections
                .Include(c => c.CreatedBy)
                .Include(c => c.CollectionSongs).ThenInclude(cs => cs.Song)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (collection is null) return Results.NotFound();

            var songs = collection.CollectionSongs
                .OrderBy(cs => cs.Song.Title)
                .Select(cs => new CollectionSongDto(cs.SongId, cs.Song.Title, cs.Song.Arranger, cs.Song.Voicing));

            return Results.Ok(new CollectionDto(
                collection.Id, collection.Name, collection.Description,
                collection.CreatedBy.Name, collection.CreatedById, songs));
        })
        .WithName("GetCollection");

        group.MapPut("/{id:int}", async (int id, UpdateCollectionRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var collection = await db.Collections.FindAsync(id);
            if (collection is null) return Results.NotFound();
            if (collection.CreatedById != singerId) return Results.Forbid();

            collection.Name = req.Name;
            collection.Description = req.Description;
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("UpdateCollection");

        group.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var collection = await db.Collections.FindAsync(id);
            if (collection is null) return Results.NotFound();
            if (collection.CreatedById != singerId) return Results.Forbid();

            db.Collections.Remove(collection);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("DeleteCollection");

        group.MapPost("/{id:int}/songs", async (int id, AddSongToCollectionRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var collection = await db.Collections.Include(c => c.CollectionSongs).FirstOrDefaultAsync(c => c.Id == id);
            if (collection is null) return Results.NotFound();
            if (collection.CreatedById != singerId) return Results.Forbid();
            if (collection.CollectionSongs.Any(cs => cs.SongId == req.SongId)) return Results.Conflict();

            var song = await db.Songs.FindAsync(req.SongId);
            if (song is null) return Results.NotFound();

            db.CollectionSongs.Add(new CollectionSong { CollectionId = id, SongId = req.SongId });
            await db.SaveChangesAsync();

            return Results.Created($"/api/collections/{id}",
                new CollectionSongDto(song.Id, song.Title, song.Arranger, song.Voicing));
        })
        .WithName("AddSongToCollection");

        group.MapDelete("/{id:int}/songs/{songId:int}", async (int id, int songId, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var collection = await db.Collections.FindAsync(id);
            if (collection is null) return Results.NotFound();
            if (collection.CreatedById != singerId) return Results.Forbid();

            var entry = await db.CollectionSongs.FindAsync(id, songId);
            if (entry is null) return Results.NotFound();

            db.CollectionSongs.Remove(entry);
            await db.SaveChangesAsync();
            return Results.NoContent();
        })
        .WithName("RemoveSongFromCollection");

        group.MapPost("/{id:int}/import", async (int id, ImportCollectionRequest req, ClaimsPrincipal user, AppDbContext db) =>
        {
            var singerId = GetSingerId(user);
            var collectionSongIds = await db.CollectionSongs
                .Where(cs => cs.CollectionId == id)
                .Select(cs => cs.SongId)
                .ToListAsync();

            if (collectionSongIds.Count == 0) return Results.Ok(new ImportResultDto(0, 0));

            var alreadyHave = (await db.SingerSongs
                .Where(ss => ss.SingerId == singerId
                    && collectionSongIds.Contains(ss.SongId)
                    && ss.Part == req.Part)
                .Select(ss => ss.SongId)
                .ToListAsync()).ToHashSet();

            var toAdd = collectionSongIds.Where(sId => !alreadyHave.Contains(sId)).ToList();
            foreach (var sId in toAdd)
                db.SingerSongs.Add(new SingerSong { SingerId = singerId, SongId = sId, Part = req.Part });

            await db.SaveChangesAsync();
            return Results.Ok(new ImportResultDto(toAdd.Count, alreadyHave.Count));
        })
        .WithName("ImportCollection");

        return app;
    }

    private static int GetSingerId(ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
