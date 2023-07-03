using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

[assembly: FunctionsStartup(typeof(MyNamespace.Startup))]

namespace MyNamespace
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddDbContext<QuartetMakerContext>((services, options) => {
                var config = services.GetRequiredService<IConfiguration>();
                options.UseSqlServer(config.GetConnectionString("DbConnectionString"));
            });

            builder.Services.AddSQLContexts();
        }
    }
}