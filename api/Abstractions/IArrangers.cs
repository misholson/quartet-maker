public interface IArrangers
{
    public Task<ICollection<Arranger>> GetArrangers(CancellationToken cancellationToken = default);

    public Task<Arranger> GetArranger(int id, CancellationToken cancellationToken = default);

    public Task<Arranger> UpdateArranger(Arranger song, CancellationToken cancellationToken = default);

    public Task DeleteArranger(Arranger song, CancellationToken cancellationToken = default);
}