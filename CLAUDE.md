# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Background

A web application that helps groups of barbershop singers find songs they all know. Each user maintains a list of songs and the part they sing (Tenor/Lead/Baritone/Bass). The "Find a Quartet" feature shows which songs a selected group of up to 4 singers can perform together — i.e., songs where every part is covered by at least one singer.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Redux Toolkit, Styled Components, React Router v7, Vite
- **Backend:** .NET 10 Minimal API (EF Core 10 + SQLite locally, SQL Server in production)


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
```

API explorer (dev only): `http://localhost:<port>/scalar/v1`

## Database

The app uses `EnsureCreated()` (not EF migrations). Schema changes must be patched manually at startup in `Program.cs`. Write all raw SQL to be compatible with both SQLite (local) and SQL Server (production) — branch on the `isSqlite` variable already computed there.

## Architecture

```
client/
  src/
    store/
      apiSlice.ts             # RTK Query — all API endpoints + generated hooks
      authSlice.ts            # auth state (token, singerId, name, role) persisted to localStorage
      index.ts                # store config + typed hooks (useAppDispatch, useAppSelector)
    pages/
      LoginPage.tsx           # Google OAuth login
      MySongsPage.tsx         # logged-in user's repertoire (add/remove songs, set part/nickname)
      QuartetFinderPage.tsx   # create/join quartets, see complete/incomplete song coverage
      CollectionsPage.tsx     # browse + create collections
      CollectionDetailPage.tsx# view/edit a collection, import to repertoire
      CollectionImportPage.tsx# admin: import collection membership from CSV
      SongImportPage.tsx      # admin: add a single song or bulk-import songs from CSV
      JoinPage.tsx            # join a quartet via invite link
    components/
      NavBar.tsx              # top nav (role-aware: Import Songs only shown to admins)
    types/
      api.ts                  # all TypeScript interfaces mirroring backend DTOs
    App.tsx                   # routing + auth guard (AuthLayout)
    main.tsx                  # entry — Redux Provider + BrowserRouter

server/QuartetMaker.Api/
  Models/
    Singer.cs                 # EF entity; has Role (User/Admin)
    Song.cs                   # EF entity; unique on (Title, Arranger, Voicing)
    SingerSong.cs             # join table with Part payload
    Role.cs / Part.cs / Voicing.cs  # enums
    Quartet.cs / QuartetMember.cs
    Collection.cs / CollectionSong.cs
  Data/
    AppDbContext.cs            # DbContext; composite PKs, string enum conversions
    Seeder.cs                  # seeds one Admin singer + collections from CSV files in Data/Seeds/
  DTOs/
    Dtos.cs                    # all request/response records in one file
  Endpoints/
    AuthEndpoints.cs           # POST /api/auth/google — Google JWT → app JWT (includes Role claim)
    SingersEndpoints.cs        # /api/singers CRUD, repertoire, nickname, preferred part, role
    SongsEndpoints.cs          # GET /api/songs, POST /api/songs, POST /api/songs/import (admin)
    QuartetEndpoints.cs        # /api/quartets CRUD + song coverage
    CollectionsEndpoints.cs    # /api/collections CRUD + CSV import (admin)
  Program.cs                   # wires DI, CORS, JWT auth, OpenAPI, schema patches, seeding
```

## API surface

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/google` | Exchange Google ID token for app JWT |
| GET | `/api/singers` | All singers with song count |
| GET | `/api/singers/{id}` | Singer with full repertoire |
| POST | `/api/singers/{id}/songs` | Add song to repertoire `{ songTitle, part, arranger, voicing }` |
| DELETE | `/api/singers/{id}/songs/{songId}/{part}` | Remove song from repertoire |
| PUT | `/api/singers/preferred-part` | Set caller's preferred part |
| PUT | `/api/singers/nickname` | Set caller's nickname |
| PUT | `/api/singers/{id}/role` | Set a singer's role — Admin only |
| GET | `/api/songs?search=` | Search songs (max 20) |
| POST | `/api/songs` | Create/find a song by (title, arranger, voicing) — Admin only |
| POST | `/api/songs/import` | Bulk-import songs from `{ songs: [{title, arranger, voicing}] }` — Admin only |
| GET | `/api/quartets/my` | Caller's quartets |
| GET | `/api/quartets/{id}` | Quartet detail |
| POST | `/api/quartets` | Create quartet |
| POST | `/api/quartets/join/{inviteCode}` | Join quartet by invite code |
| GET | `/api/quartets/{id}/songs` | Song coverage for a quartet |
| GET | `/api/collections` | All collections (searchable) |
| GET | `/api/collections/{id}` | Collection detail with songs |
| POST | `/api/collections` | Create collection |
| PUT | `/api/collections/{id}` | Update collection (owner only) |
| DELETE | `/api/collections/{id}` | Delete collection (owner only) |
| POST | `/api/collections/{id}/songs` | Add song to collection (owner only) |
| DELETE | `/api/collections/{id}/songs/{songId}` | Remove song from collection (owner only) |
| POST | `/api/collections/{id}/import` | Import all collection songs to caller's repertoire |
| POST | `/api/collections/import-csv` | Bulk-import songs into collections from CSV — Admin only |
| POST | `/api/collections/add-song-by-name` | Add a song to a named collection (find-or-create) — Admin only |

## Data model

- `Singer` ←→ `SingerSong` ←→ `Song` (many-to-many; `Part` is a payload column on the join table)
- Composite PK on `SingerSong` is `(SingerId, SongId, Part)` — a singer can know the same song on multiple parts
- `Song` is unique on `(Title, Arranger, Voicing)`
- `Singer.Role` is `User` (default) or `Admin`
- `Quartet` ←→ `QuartetMember` ←→ `Singer`
- `Collection` ←→ `CollectionSong` ←→ `Song`

## Auth & roles

- Authentication is via Google OAuth. The frontend sends a Google ID token to `/api/auth/google`, which validates it and issues a signed app JWT.
- The JWT contains the singer's `Role` as a `ClaimTypes.Role` claim.
- `Role.Admin` is required for song import, collection CSV import, and role management endpoints.
- The frontend reads `role` from the `LoginResponse` and stores it in Redux + localStorage. Admin-only UI (Import Songs nav link, Import CSV button on Collections) is hidden from non-admins.
- To promote a user to Admin: `UPDATE Singers SET Role = 'Admin' WHERE Id = <id>` or call `PUT /api/singers/{id}/role` as an existing admin.

## Styled Components conventions

Transient props (not forwarded to the DOM) use the `$` prefix — e.g., `$selected`, `$covered`, `$part` — to avoid React DOM prop warnings.
