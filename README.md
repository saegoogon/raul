# BlackSmile Cloud

File storage at [blacksmile.co.kr](https://www.blacksmile.co.kr): upload, folders, preview, trash, and share links. Next.js 16 + Supabase (Auth, Postgres, Storage).

## Setup

1. In the Supabase SQL editor, run `supabase/schema.sql`, then `supabase/handle-new-user.sql`.
2. Set env vars (locally in `.env.local`, and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only, used for public share links)
3. `npm install` and `npm run dev`.

## Limits

- 1 GB per account, 50 MB per file (`src/lib/drive.ts`).
- Files live in the private `drive` bucket at `<user id>/<item id>` and are served through short-lived signed URLs.
