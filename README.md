# BlackSmile Links

Short links, a link-in-bio page, and click analytics at [blacksmile.co.kr](https://www.blacksmile.co.kr). Next.js 16 + Supabase (Auth, Postgres).

- Short links: `blacksmile.co.kr/l/<code>`
- Public page: `blacksmile.co.kr/@<username>`
- Dashboard: `/dashboard` (links), `/dashboard/analytics`, `/dashboard/page`

## Setup

1. In the Supabase SQL editor, run `supabase/schema.sql`, then `supabase/handle-new-user.sql`.
2. Set env vars (locally in `.env.local`, and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `npm install` and `npm run dev`.

Public reads and click logging go through `security definer` functions (`follow_link`, `public_page`, `record_page_view`), so no service role key is needed.
