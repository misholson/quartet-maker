public interface IUsers
{
    public Task<ICollection<User>> GetUser(CancellationToken cancellationToken = default);

    public Task<User> GetUser(int id, CancellationToken cancellationToken = default);

    public Task<User> UpdateUser(User song, CancellationToken cancellationToken = default);

    public Task DeleteUser(User song, CancellationToken cancellationToken = default);
}