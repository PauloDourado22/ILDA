# Café Site with a Custom Mini-CMS

A public café website (Next.js, ISR) whose content — homepage text, opening
hours, and the entire menu, including photos — is edited through a small
admin panel, backed by an Express + SQLite API. No code changes, no
redeploy, no calling a developer to fix a typo in the menu.

This is the "small business / brochure site" service package rebuilt in
React/Next.js + Node — and deliberately different in kind from the existing
Cafe-Website project (Flask CRUD app): the story here is "the client can
maintain this themselves," not just "I built a database-backed site."

**Live pitch for a client:** "Update your hours or add a new menu item
yourself, any time — you don't need me for that. I'm here for anything you
can't do from the dashboard."

## Architecture

```
public site (Next.js, ISR, revalidate: 60s)  →  GET /api/content  →  SQLite
admin panel (Next.js, JWT-protected)          →  /api/admin/*     →  SQLite + /uploads
```

The public homepage is a **server component** that fetches
`GET /api/content` with `next: { revalidate: 60 }` (see `frontend/app/lib/api.js`).
That's the whole mechanism behind "no redeploy": Next.js serves a cached
version of the page for up to 60 seconds, then quietly regenerates it in the
background. The café owner edits the menu, and the public site reflects it
within a minute — without a build, a deploy, or a developer in the loop.

## What's genuinely worth pointing at

- **Image uploads are treated as untrusted input, properly.**
  `backend/src/middleware/upload.js` replaces every uploaded filename with a
  random UUID (never trusts the client's filename — that's how you get path
  traversal or one upload silently overwriting another), checks MIME type
  against an allow-list (not a deny-list, which is trivially bypassed), and
  caps file size. This is the one part of the API that accepts arbitrary
  binary data from a browser, so it gets the most scrutiny.
- **A single-row `site_settings` table**, not a generic key-value store —
  there's exactly one café with one set of homepage copy, so the schema says
  that directly instead of modeling flexibility nobody needs yet.
- **`hours` always has exactly 7 rows** (seeded once, always updated via
  `UPDATE`), so the admin form never has to handle "the Tuesday row doesn't
  exist yet."

## Running it locally

```bash
# backend
cd backend
cp .env.example .env
npm install
npm run seed        # owner login + sample café content
npm run dev          # http://localhost:4200

# frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev           # http://localhost:3200
```

Public site: http://localhost:3200
Admin panel: http://localhost:3200/admin/login — seeded login
`owner@example.com` / `change-me-please` (change before showing anyone).

## Deploying

- **Backend:** Render/Railway. Mount a persistent disk for both the SQLite
  file and the `uploads/` folder, or move uploads to S3/Cloudflare R2 for a
  real production deployment (local disk storage doesn't survive a redeploy
  on most PaaS providers).
- **Frontend:** Vercel.

## What a v2 would add

- Move uploaded images to object storage (S3/R2) instead of local disk —
  the current setup works for a single-instance demo but won't survive a
  redeploy on most hosting providers.
- Drag-and-drop reordering for menu items and categories (sort_order exists
  in the schema, just no UI for changing it yet).
- Image resizing/optimization on upload (e.g. via sharp) instead of serving
  whatever size the owner uploads.
# SF-Cafe
