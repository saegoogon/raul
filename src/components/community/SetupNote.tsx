import type { CommunityStatus } from "@/lib/community/queries";

export function SetupNote({ status }: { status: CommunityStatus }) {
  if (status === "ok") return null;
  return (
    <p className="setup-note">
      {status === "missing"
        ? "Community tables are missing. Run supabase/community.sql in the Supabase SQL editor."
        : "Cannot reach the database. Check Supabase env vars."}
    </p>
  );
}
