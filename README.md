# CalAgg

Calendar Aggregator. Connect multiple Google accounts and one-way mirror selected source calendars onto a dedicated target calendar under your main account. Every mirrored event carries provenance so native Google Calendar (web or phone) is enough. No Chrome extension.

One-way only: source to target. Never ping-pong. The target is a dedicated calendar (default name "From other calendars"), never Primary.

## What it does

- First Google login is the main account (target owner).
- Later Add account links work or secondary Google accounts to the same CalAgg user.
- Sync routes map a source calendar to the target with a title prefix, provenance block, per-source color, privacy mode (full / title / busy), and filters (declined, OOO, focus time, optional all-day).
- Background poll every 5 minutes.
- Disconnect an account wipes EventMaps and deletes mirrored events on the target.

## Local run

Requires Node 20+. Copy `.env.example` to `.env` and fill Google OAuth plus encryption keys.

Generate keys:

    openssl rand -hex 32
    openssl rand -base64 32

Then from /workspace/calagg:

    npm install
    npx prisma migrate dev --name init
    npm run dev

If migrate is interactive, `npx prisma db push` is equivalent for SQLite.

Open http://localhost:3000

The Next.js process starts the poll worker via instrumentation.ts. A standalone worker is `npm run worker`. Tests are `npm test`.

SQLite is the default. Database file: prisma/dev.db. No extra services.


## Environment

See `.env.example`. Required:

- GOOGLE_CLIENT_ID — OAuth Web client id
- GOOGLE_CLIENT_SECRET — OAuth Web client secret
- GOOGLE_REDIRECT_URI — extra-account callback, http://localhost:3000/api/accounts/callback
- TOKEN_ENCRYPTION_KEY — 64 hex chars (32 bytes). AES-256-GCM for refresh tokens
- DATABASE_URL — file:./dev.db
- NEXTAUTH_SECRET — session signing
- NEXTAUTH_URL — http://localhost:3000

Optional: SYNC_INTERVAL_MS (default 300000), ENABLE_WORKER=false to disable in-process polling.

## Google Cloud setup (personal / test mode)

You cannot complete OAuth until these exist. The app code paths are complete; Google will not issue tokens without a client.

1. Open Google Cloud Console and create a project (e.g. calagg).
2. APIs and Services, Library: enable Google Calendar API.
3. APIs and Services, OAuth consent screen:
   - User type: External
   - App name: CalAgg
   - Publishing status: Testing for personal use
   - Scopes: https://www.googleapis.com/auth/calendar plus openid, email, profile
   - Test users: add every Gmail you will connect (main + work/secondary)
4. Credentials, Create OAuth client ID, application type Web application
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs — add both:
     - http://localhost:3000/api/auth/callback/google  (NextAuth, first/main login)
     - http://localhost:3000/api/accounts/callback     (linked extra accounts)
5. Copy the client id and secret into `.env`.
6. Restart the dev server, visit /login, Continue with Google.

After OAuth works:

1. First Google account = main. CalAgg stores the encrypted refresh token.
2. Setup wizard: create or select "From other calendars" on the main account.
3. Add another Google account (or skip and pick other calendars on the main account).
4. Choose sources, prefix, privacy; run first sync.
5. Open Google Calendar as the main user, show the target calendar.

If Google returns no refresh_token (you previously granted the app), revoke CalAgg under Google Account, Third-party access, and sign in again. The app always requests prompt=consent and access_type=offline.


## Sync engine

On poll or Resync:

1. List source events with a stored syncToken, or a plus/minus 3 month window (singleEvents=true so recurrences are instances). Invalid/expired sync tokens trigger a full window resync (HTTP 410).
2. Skip events that already have calagg_* private extended properties (never re-clone CalAgg mirrors).
3. Apply route filters.
4. Map through privacy mode plus provenance.
5. Upsert on the target calendar using the main account token (events.insert / events.patch). Deletes use events.delete when the source is cancelled or now filtered.
6. EventMap is unique on (sourceCalendarId, sourceEventId).

Writes never use a source token. Reads never use the target token except to mutate the dedicated target calendar.

Provenance on the mirrored event:

    Source: Acme Work · Team calendar
    Account: you@acme.com
    Open original: <link if available>
    Synced by CalAgg · do not edit

Private extended properties: calagg_route_id, calagg_source_event_id, calagg_source_cal_id, calagg_source_account.

Privacy:

- full — title, time, location, original description under the provenance block, Meet/conference if present
- title — prefixed title + time + provenance only
- busy — [Prefix] Busy (customizable) + provenance that names the source that reserved the time

## Implemented vs skipped

Implemented (P0):

- Next.js App Router, TypeScript, Tailwind, Prisma + SQLite
- NextAuth Google login (main account) + custom OAuth for extra accounts
- AES-256-GCM refresh token encryption
- Data model: User, GoogleAccount, CalendarRef, SyncRoute, EventMap, SyncJob
- Onboarding, Status, Routes, Settings
- Real Calendar API list/insert/patch/delete
- Poll worker in-process and standalone worker script
- Disconnect account + delete-all-mirrors
- Unit tests for privacy mapping, filters, EventMap insert/patch/delete decisions, crypto

Not in v1:

- Google Calendar push channels / webhooks (poll only)
- Postgres docker-compose (SQLite is the default; Prisma can switch later)
- Recurring series-master clone (instances in a plus/minus 3 month window instead)
- Chrome extension (intentionally out of scope)

## Project layout

    src/app            UI + API routes
    src/lib/auth.ts    NextAuth
    src/lib/google.ts  Calendar API + OAuth client
    src/lib/sync       mapper, filters, engine
    src/lib/worker.ts  interval poller
    prisma/schema.prisma
