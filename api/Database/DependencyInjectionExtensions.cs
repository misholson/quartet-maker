using Microsoft.Extensions.DependencyInjection;

public static class SQLDependencyInjectionExtensions
{
    public static IServiceCollection AddSQLContexts(this IServiceCollection services)
    {
        return services.AddScoped<IArrangements, ArrangementsContext>()
        .AddScoped<IArrangers, ArrangersContext>()
        .AddScoped<ISongs, SongsContext>();
    }
}