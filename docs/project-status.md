# Mood Pool Project Status

Last updated: 2026-06-11

## What Has Been Built

- Created the first Web H5 version of Mood Pool with Vite, React, and TypeScript.
- Built the core mood model:
  - Subjects, such as work or a friend.
  - Positive and negative mood entries.
  - Three ball sizes: small = 1, medium = 2, large = 3.
  - Net score = positive total - negative total.
- Built the main pool page:
  - Subject switching from the title.
  - Positive/negative mood atmosphere.
  - Bottom-settled mood balls with a gravity-like layout.
  - Quick throw controls for mood kind, size, note, and submit.
- Built records:
  - Card-style record list.
  - Filter by all, positive, or negative.
  - Long notes wrap safely.
- Built settings:
  - Rename the current subject.
  - Customize positive and negative ball colors.
  - Email magic-link login for Supabase cloud sync.
- Improved C-end H5 UI details:
  - Records and settings moved to corner icon buttons.
  - Mood Pool brand eyebrow removed from the main UI.
  - Header alignment fixed.
  - Outer page padding removed and frame width made adaptive.
  - Pool height reduced so the throw controls stay closer.
  - Input focus states softened.
  - Login UI changed from a cramped inline form to a clear cloud-sync module.
- Improved runtime behavior:
  - Local storage fallback works when Supabase env vars are missing.
  - Supabase env vars are supported through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Supabase schema exists in `supabase/schema.sql`.
  - Supabase Data API connectivity was checked after schema execution.
  - Full-screen loading is now limited to initial load or auth switching.
  - Throwing a ball now keeps the page in place and only shows a lightweight syncing state.

## Current Local State

- Local Supabase config is in `.env.local`.
- `.env.local` is ignored by Git and must not be committed.
- Supabase SQL has been executed in the project by the project owner.
- The latest local commit is:

```txt
d891694 Improve auth flow and mood pool interactions
```

- Push to GitHub is currently blocked because the local SSH identity is a deploy key without write permission:

```txt
ERROR: Permission to OakleyCasey/mood.git denied to deploy key
```

## Verification Already Run

```bash
npm run typecheck
npm run build
```

Both passed after the latest changes.

## TODO: Open With A Real Domain

### 1. Push Code To GitHub

- Fix GitHub write access first.
- Current remote:

```txt
git@github.com:OakleyCasey/mood.git
```

- Options:
  - Enable write access for the current deploy key.
  - Switch to an SSH key with write access.
  - Log in with GitHub CLI using `gh auth login`.
  - Use an HTTPS remote with a GitHub token.

- After access is fixed:

```bash
git push origin main
```

### 2. Create Vercel Project

- In Vercel, import the GitHub repository.
- Framework preset: Vite.
- Build command:

```bash
npm run build
```

- Output directory:

```txt
dist
```

### 3. Add Vercel Environment Variables

Add these in Vercel Project Settings:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Use the same values as local `.env.local`, but do not commit those values to Git.

### 4. Deploy And Test Vercel Preview Domain

- Deploy once and get the generated `*.vercel.app` domain.
- Open the Vercel domain and test:
  - Page loads.
  - Email magic-link login works.
  - Create subject.
  - Throw positive and negative balls.
  - Refresh page and confirm data persists.
  - Records and settings still work.

### 5. Configure Supabase Auth URLs

After the Vercel domain is known, update Supabase:

```txt
Authentication -> URL Configuration
```

Set:

```txt
Site URL: https://your-vercel-domain.vercel.app
Redirect URLs:
https://your-vercel-domain.vercel.app
http://127.0.0.1:5174
http://localhost:5174
```

### 6. Bind A Real Domain In Vercel

- In Vercel:

```txt
Project -> Settings -> Domains
```

- Add the real domain, for example:

```txt
mood.example.com
```

- Update DNS according to Vercel's instruction, usually with a CNAME or A record.
- Wait for DNS and HTTPS certificate provisioning.

### 7. Add Real Domain To Supabase Auth

After the real domain works, update Supabase again:

```txt
Site URL: https://mood.example.com
Redirect URLs:
https://mood.example.com
https://your-vercel-domain.vercel.app
http://127.0.0.1:5174
http://localhost:5174
```

### 8. Final Production Smoke Test

- Open the real domain on mobile.
- Log in through email magic link.
- Add a subject.
- Throw positive and negative balls.
- Check records.
- Change colors.
- Refresh and confirm data persists.
- Test logout and login again.

## Deployment Notes

- The current deployment direction is Vercel + Supabase.
- Under this direction, the app is not using mainland China hosting or mainland CDN by default.
- If the project later moves to a mainland China cloud provider or mainland CDN, ICP filing requirements need to be revisited.
- The future WeChat mini program version is out of v1 scope, but the data model can be reused.
