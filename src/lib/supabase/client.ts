import { createBrowserClient } from "@supabase/ssr";

function createBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

let browserClient: ReturnType<typeof createBrowser> | undefined;

export function createClient() {
  browserClient ??= createBrowser();
  return browserClient;
}
