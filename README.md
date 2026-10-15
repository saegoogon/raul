# BlackSmile

A dark GitHub at [blacksmile.co.kr](https://www.blacksmile.co.kr). Next.js 16 + Supabase Auth.

Night board for people who write code. Posts, optional code (paste or file), Feel, this week’s top 3, trends. Run `supabase/snippets.sql` in the Supabase SQL editor after profiles exist (`supabase/schema.sql` + `supabase/handle-new-user.sql`).

## Setup

1. Set env vars (locally in `.env.local`, and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. `npm install` and `npm run dev`.
