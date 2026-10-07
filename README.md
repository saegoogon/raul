# BlackSmile

Shop at [blacksmile.co.kr](https://www.blacksmile.co.kr). Next.js 16 + Supabase Auth.

Catalog data lives in `src/data/products.ts` so it can move to a database later. The bag is on this device for now (`localStorage`), behind `src/lib/cart`.

## Setup

1. Set env vars (locally in `.env.local`, and on Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. `npm install` and `npm run dev`.
