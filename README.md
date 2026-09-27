# Minisign

A lightweight e-signature web app: upload documents, draw or generate a signature, and send a signing link to others. A DocuSign-style flow rebuilt in a weekend-scale project — dashboard, signer pages, and a signature generator included.

## Features

- **Document dashboard** — upload PDFs and track their signing status (pending / signed) from a personal dashboard
- **Signature generator** — draw your signature with the mouse/touch or type a name and pick a signature style
- **Signing links** — generate a shareable link per document (`/sign/<id>`) so anyone can view and sign it without an account
- **Owner signing flow** — sign your own documents directly from the dashboard (`/sign` + `/view` pages)
- **PDF viewer** — built-in document preview rendered in the browser
- **Auth** — JWT-based login with demo/preview mode for testing without a database
- **Themed UI** — dark/light theme toggle, built with shadcn/ui + Radix primitives

## Tech stack

- **Next.js 15** (App Router, server actions) + **React 19** + TypeScript
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **Supabase** (PostgreSQL) — document + user storage; SQL schema in `scripts/01-create-documents-table.sql`
- **Vercel Blob** — uploaded document storage (`@vercel/blob`)
- **JWT** auth via `jose`

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the vars below
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `JWT_SECRET` | Secret for signing auth cookies |
| `PREVIEW_MODE` | Set to `1`/`true` to run without Supabase (demo data) |

Run `scripts/01-create-documents-table.sql` in your Supabase SQL editor to create the `documents` table.

## Project structure

```
app/
  page.tsx                 # Dashboard (signed-in) / landing (signed-out)
  sign/[id]/page.tsx       # Public signing page for a document
  view/[id]/page.tsx       # Document view page
  api/auth/callback/       # Supabase auth callback route
components/
  mini-sign-dashboard.tsx  # Upload + document list UI
  signature-generator.tsx  # Draw/type signature pad
  owner-signer.tsx          # Owner-side signing flow
  signer-component.tsx      # Guest signer flow
  simple-pdf-viewer.tsx     # In-browser PDF preview
  login-button.tsx / logout-button.tsx
  app-header.tsx / footer.tsx / theme-provider.tsx
lib/
  actions.ts               # Server actions (CRUD, signing, Blob upload)
  auth.ts / auth-utils.ts   # JWT session helpers
  supabase.ts              # Supabase client
scripts/
  01-create-documents-table.sql
```

## Deployment

This app needs server-side APIs (server actions, Blob, Supabase), so it deploys to a Node host — e.g. Vercel (`vercel deploy`) or any Next.js-compatible platform. It is not a static site, so GitHub Pages is not applicable.

## Original v0 project

This repository was initialized from a [v0](https://v0.app) project. Any changes made in the v0 chat are automatically synced here.

---

Built by Girish Lade — https://ladestack.in
