public interface IArrangements
{
    public Task<Arrangement> GetArrangement(int id, CancellationToken cancellationToken = default);

    public Task<Arrangement> UpdateArrangement(Arrangement song, CancellationToken cancellationToken = default);

    public Task DeleteArrangement(Arrangement song, CancellationToken cancellationToken = default);
}