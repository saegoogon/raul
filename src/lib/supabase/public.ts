import { createClient } from "@supabase/supabase-js";

function createPublic() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

let client: ReturnType<typeof createPublic> | undefined;

export function createPublicClient() {
  client ??= createPublic();
  return client;
}
