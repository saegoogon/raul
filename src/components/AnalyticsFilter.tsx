"use client";

import { useRouter } from "next/navigation";
import { RANGES, type RangeKey } from "@/lib/links";

export function AnalyticsFilter({
  range,
  linkId,
  links,
}: {
  range: RangeKey;
  linkId: string | null;
  links: { id: string; title: string }[];
}) {
  const router = useRouter();
  const go = (nextRange: string, nextLink: string | null) => {
    const params = new URLSearchParams({ range: nextRange });
    if (nextLink) params.set("link", nextLink);
    router.push(`/dashboard/analytics?${params}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={linkId ?? ""}
        onChange={(event) => go(range, event.target.value || null)}
        className="h-9 max-w-56 rounded-full bg-ink px-3 text-sm outline-none"
        aria-label="Link"
      >
        <option value="">All links</option>
        {links.map((link) => (
          <option key={link.id} value={link.id}>
            {link.title}
          </option>
        ))}
      </select>
      <div className="flex h-9 rounded-full bg-ink p-1">
        {(Object.keys(RANGES) as RangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => go(key, linkId)}
            aria-pressed={range === key}
            className={`rounded-full px-3 text-xs font-medium ${range === key ? "bg-paper text-night" : "text-mute hover:text-paper"}`}
          >
            {key}d
          </button>
        ))}
      </div>
    </div>
  );
}
