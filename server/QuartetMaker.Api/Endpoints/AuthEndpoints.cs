using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuartetMaker.Api.Data;
using QuartetMaker.Api.DTOs;
using QuartetMaker.Api.Models;

namespace QuartetMaker.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app, IConfiguration config)
    {
        app.MapPost("/api/auth/google", async (GoogleLoginRequest req, AppDbContext db) =>
        {
            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [config["Google:ClientId"]],
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(req.IdToken, settings);
            }
            catch (InvalidJwtException)
            {
                return Results.Unauthorized();
            }

            var singer = await db.Singers.FirstOrDefaultAsync(s => s.GoogleId == payload.Subject);

            if (singer is null)
            {
                singer = new Singer
                {
                    GoogleId = payload.Subject,
                    Name = payload.Name ?? payload.Email,
                    Email = payload.Email,
                };
                db.Singers.Add(singer);
                await db.SaveChangesAsync();
            }

            var token = BuildJwt(singer, config);
            return Results.Ok(new LoginResponse(token, singer.Id, singer.Name));
        })
        .WithTags("Auth")
        .WithName("GoogleLogin")
        .AllowAnonymous();

        return app;
    }

    private static string BuildJwt(Singer singer, IConfiguration config)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddHours(double.Parse(config["Jwt:ExpiryHours"]!));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, singer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, singer.Name),
                new Claim(JwtRegisteredClaimNames.Email, singer.Email ?? string.Empty),
            ],
            expires: expiry,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
