# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Background

A web application that helps groups of barbershop singers find songs they all know. Each user maintains a list of songs and the part they sing (Tenor/Lead/Baritone/Bass). The "Find a Quartet" feature shows which songs a selected group of up to 4 singers can perform together — i.e., songs where every part is covered by at least one singer.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Redux Toolkit, Styled Components, React Router v7, Vite
- **Backend:** .NET 10 Minimal API (EF Core 10 + SQLite)

## git

At the beginning of the session, if in the main branch, create a new branch before making changes.

## Commands

**Frontend** — run from `client/`:
```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the production build
```

**Backend** — run from `server/QuartetMaker.Api/`:
```bash
dotnet run       # API at http://localhost:5062 (or port in launchSettings)
dotnet build     # compile check
dotnet ef migrations add <Name>   # add EF Core migration
dotnet ef database update         # apply migrations
```

API explorer (dev only): `http://localhost:<port>/scalar/v1`

## Architecture

```
client/
  src/
    store/
      singersSlice.ts         # Redux state: singers[], currentSingerId
      index.ts                # store config + typed hooks (useAppDispatch, useAppSelector)
    pages/
      MySongsPage.tsx         # logged-in user's repertoire (add/remove songs)
      QuartetFinderPage.tsx   # select ≤4 singers, see complete/incomplete song coverage
    components/
      NavBar.tsx              # top nav
    App.tsx                   # routing (/ → /my-songs, /my-songs, /quartet)
    main.tsx                  # entry — Redux Provider + BrowserRouter

server/QuartetMaker.Api/
  Models/
    Singer.cs / Song.cs / SingerSong.cs   # EF Core entities
  Data/
    AppDbContext.cs            # DbContext; composite PK on SingerSong(SingerId,SongId,Part)
    Seeder.cs                  # idempotent seed — 5 singers, 5 songs, sample repertoire
  DTOs/
    Dtos.cs                    # all request/response records in one file
  Endpoints/
    SingersEndpoints.cs        # /api/singers CRUD + repertoire management
    QuartetEndpoints.cs        # /api/quartet?singerIds=1&singerIds=2
  Program.cs                   # wires DI, CORS, OpenAPI, seeding, endpoint groups
```

## API surface

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/singers` | All singers with song count |
| GET | `/api/singers/{id}` | Singer with full repertoire |
| POST | `/api/singers/{id}/songs` | Add song to repertoire `{ songTitle, part }` |
| DELETE | `/api/singers/{id}/songs/{songId}/{part}` | Remove song from repertoire |
| GET | `/api/quartet?singerIds=1&singerIds=2…` | Coverage analysis for selected singers |

Songs are a shared entity (unique by title). `POST /songs` finds-or-creates the song, then links it to the singer.

## Data model

`Singer` ←→ `SingerSong` ←→ `Song` (many-to-many with `Part` as payload on the join table). Composite PK on `SingerSong` is `(SingerId, SongId, Part)` — a singer can know the same song on multiple parts.

## Database

When writing SQL queries, make them compatible with both sqlite (when running locally) and SQL (for when deployed to Azure SQL).

## Frontend state model

The Redux store has a single `singers` slice:
- `singers: Singer[]` — all singers, each with `repertoire: { songTitle, part }[]`
- `currentSingerId: string` — simulates the logged-in user (hardcoded to `'1'` until auth is added)

The frontend currently uses in-memory Redux state seeded at startup; wiring it to the backend API is the next step.

## Styled Components conventions

Transient props (not forwarded to the DOM) use the `$` prefix — e.g., `$selected`, `$covered`, `$part` — to avoid React DOM prop warnings.
