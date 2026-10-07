# BlackSmile

Community at [blacksmile.co.kr](https://www.blacksmile.co.kr). Next.js 16 + Supabase Auth.

Rooms, threads, replies, votes. Run `supabase/community.sql` in the Supabase SQL editor after profiles exist (`supabase/schema.sql` + `supabase/handle-new-user.sql`).

## Setup

1. Set env vars (locally in `.env.local`, and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. `npm install` and `npm run dev`.
