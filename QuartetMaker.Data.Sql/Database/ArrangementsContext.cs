using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class ArrangementsContext : IArrangements
{
    private QuartetMakerContext _db;

    public ArrangementsContext(QuartetMakerContext db)
    {
        _db = db;
    }

    public async Task<Arrangement> GetArrangement(int id, CancellationToken cancellationToken = default)
    {
        return await _db.Arrangements?.FirstOrDefaultAsync(ent => ent.ID == id, cancellationToken);
    }

    public async Task<Arrangement> UpdateArrangement(Arrangement song, CancellationToken cancellationToken = default)
    {
        var entity = await GetArrangement(song.ID);
        if (entity == null)
        {
            _db.Arrangements.Add(entity);
        }
        else
        {
            _db.Arrangements.Update(entity);
        }
        await _db.SaveChangesAsync(cancellationToken);

        return song;
    }

    public async Task DeleteArrangement(Arrangement song, CancellationToken cancellationToken = default)
    {
        _db.Arrangements.Remove(song);
        await _db.SaveChangesAsync(cancellationToken);
    }
}