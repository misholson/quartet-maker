using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

public class ArrangersContext : IArrangers
{
    private QuartetMakerContext _db;

    public ArrangersContext(QuartetMakerContext db)
    {
        _db = db;
    }

    public async Task<Arranger> GetArranger(int id, CancellationToken cancellationToken = default)
    {
        return await _db.Arrangers.FirstOrDefaultAsync(ent => ent.ID == id, cancellationToken);
    }

    public async Task<Arranger> UpdateArranger(Arranger arranger, CancellationToken cancellationToken = default)
    {
        var entity = await GetArranger(arranger.ID);
        if (entity == null)
        {
            _db.Arrangers.Add(entity);
        }
        else
        {
            _db.Arrangers.Update(entity);
        }
        await _db.SaveChangesAsync(cancellationToken);

        return arranger;
    }

    public async Task DeleteArranger(Arranger arranger, CancellationToken cancellationToken = default)
    {
        _db.Arrangers.Remove(arranger);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ICollection<Arranger>> GetArrangers(CancellationToken cancellationToken = default)
    {
        return await _db.Arrangers.ToListAsync();
    }
}