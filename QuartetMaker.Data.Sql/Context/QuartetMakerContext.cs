using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

public class QuartetMakerContext : DbContext
{
    public DbSet<Arranger>? Arrangers { get; set; }
    public DbSet<Song>? Songs { get; set; }
    public DbSet<User>? Users { get; set; }

    public DbSet<Arrangement>? Arrangements { get; set; }

    public DbSet<KnownArrangement>? KnownArrangements { get; set; }

    //public string DbPath { get; }


    public QuartetMakerContext(DbContextOptions<QuartetMakerContext> options)
        : base(options)
    {
        var folder = Environment.SpecialFolder.LocalApplicationData;
        var path = Environment.GetFolderPath(folder);
        //DbPath = System.IO.Path.Join(path, "blogging.db");
    }

    // The following configures EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        Console.WriteLine($"Hello, world: {options.IsConfigured}");
        if (!options.IsConfigured) {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("local.settings.json")
                .Build();
            Console.WriteLine(configuration.GetConnectionString("DbConnectionString"));
            options.UseSqlServer(configuration.GetConnectionString("DbConnectionString"));
        }
    }
}