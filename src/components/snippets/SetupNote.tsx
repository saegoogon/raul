import type { SnippetStatus } from "@/lib/snippets/queries";

export function SetupNote({ status }: { status: SnippetStatus }) {
  if (status === "ok") return null;
  return (
    <p className="setup-note">
      {status === "missing"
        ? "Snippet tables are missing. Run supabase/snippets.sql in the Supabase SQL editor."
        : "Cannot reach the database. Check Supabase env vars."}
    </p>
  );
}
