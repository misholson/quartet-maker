public interface ISongs
{
    public Task<ICollection<Song>> GetSongs(CancellationToken cancellationToken = default);

    public Task<Song> GetSong(int id, CancellationToken cancellationToken = default);

    public Task<Song> UpdateSong(Song song, CancellationToken cancellationToken = default);

    public Task DeleteSong(Song song, CancellationToken cancellationToken = default);
}