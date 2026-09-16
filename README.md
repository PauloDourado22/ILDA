# ILDA

A café website with a small custom CMS — the owner edits the homepage copy, opening hours and the full menu themselves through an admin panel, no redeploy needed.

Built as a freelance-style project: the brief was "a café needs a site it can actually update," not just a static page.

## Stack

- **Frontend:** Next.js (App Router), plain CSS
- **Backend:** Express, SQLite (better-sqlite3), JWT auth for the admin panel

## Running locally

```bash
# backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev        # http://localhost:4200

# frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev         # http://localhost:3200
```

Admin panel lives at `/admin/login` on the frontend.
