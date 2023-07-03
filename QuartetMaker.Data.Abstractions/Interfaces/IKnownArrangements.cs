public interface IKnownArrangements
{
    public Task<ICollection<KnownArrangement>> GetKnownArrangements(int userID, CancellationToken cancellationToken = default);

    public Task<KnownArrangement> UpdateKnownArrangement(KnownArrangement song, CancellationToken cancellationToken = default);

    public Task DeleteKnownArrangement(KnownArrangement song, CancellationToken cancellationToken = default);
}