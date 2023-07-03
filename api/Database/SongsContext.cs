using Microsoft.EntityFrameworkCore;

public class SongsContext : ISongs
{
    private QuartetMakerContext _db;

    public SongsContext(QuartetMakerContext db)
    {
        _db = db;
    }

    public async Task<Song> GetSong(int id, CancellationToken cancellationToken = default)
    {
        return await _db.Songs.FirstOrDefaultAsync(ent => ent.ID == id, cancellationToken);
    }

    public async Task<Song> UpdateSong(Song song, CancellationToken cancellationToken = default)
    {
        var entity = await GetSong(song.ID);
        if (entity == null)
        {
            _db.Songs.Add(entity);
        }
        else
        {
            _db.Songs.Update(entity);
        }
        await _db.SaveChangesAsync(cancellationToken);

        return song;
    }

    public async Task DeleteSong(Song song, CancellationToken cancellationToken = default)
    {
        _db.Songs.Remove(song);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ICollection<Song>> GetSongs(CancellationToken cancellationToken = default)
    {
        return await _db.Songs.ToListAsync();
    }
}