import Link from "next/link";
import { AnalyticsFilter } from "@/components/AnalyticsFilter";
import { Icon, type IconName } from "@/components/Icon";
import { RANGES, shortUrl, type RangeKey } from "@/lib/links";
import { clicksByLink, listLinks, requireUser, since } from "@/lib/links-server";

export const metadata = { title: "Analytics" };

type Row = { value: string; clicks: number };

const COUNTRY = new Intl.DisplayNames(["en"], { type: "region" });
const DAY = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Asia/Seoul" });

function countryName(code: string) {
  if (code.length !== 2) return code;
  try {
    return COUNTRY.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function seoulDate(time: number) {
  return new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function dailyBars(series: { day: string; clicks: number }[], days: number) {
  const byDay = new Map(series.map((row) => [row.day, row.clicks]));
  const today = Date.now();
  return Array.from({ length: days }, (_, index) => {
    const time = today - (days - 1 - index) * 86_400_000;
    return { time, clicks: byDay.get(seoulDate(time)) ?? 0 };
  });
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/dashboard/analytics">) {
  const params = await searchParams;
  const range: RangeKey = typeof params.range === "string" && params.range in RANGES ? (params.range as RangeKey) : "30";
  const days = RANGES[range];
  const { supabase } = await requireUser();
  const links = await listLinks();
  const linkId = typeof params.link === "string" && links.some((link) => link.id === params.link) ? params.link : null;
  const from = since(days);

  const breakdown = async (dim: string) => {
    const { data } = await supabase.rpc("click_breakdown", { p_since: from, p_dim: dim, p_link: linkId });
    return ((data ?? []) as Row[]).map((row) => ({ value: row.value, clicks: Number(row.clicks) }));
  };

  const [series, perLink, referrers, countries, devices, sources, views] = await Promise.all([
    supabase.rpc("click_series", { p_since: from, p_link: linkId }).then(({ data }) =>
      ((data ?? []) as { day: string; clicks: number }[]).map((row) => ({ day: row.day, clicks: Number(row.clicks) })),
    ),
    clicksByLink(days),
    breakdown("referrer"),
    breakdown("country"),
    breakdown("device"),
    breakdown("source"),
    supabase.rpc("page_view_count", { p_since: from }).then(({ data }) => Number(data ?? 0)),
  ]);

  const bars = dailyBars(series, days);
  const total = bars.reduce((sum, bar) => sum + bar.clicks, 0);
  const peak = Math.max(1, ...bars.map((bar) => bar.clicks));
  const pageClicks = sources.find((row) => row.value === "page")?.clicks ?? 0;
  const top = links
    .map((link) => ({ link, clicks: perLink[link.id] ?? 0 }))
    .filter((row) => row.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);
  const selected = links.find((link) => link.id === linkId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-mute">
            {selected ? `${selected.title} · ${shortUrl(selected.slug)}` : "All links"} · last {days} days
          </p>
        </div>
        <AnalyticsFilter
          range={range}
          linkId={linkId}
          links={links.map((link) => ({ id: link.id, title: link.title }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon="cursor" label="Clicks" value={total} />
        <Stat icon="eye" label="Page views" value={views} hint={selected ? "Whole page" : undefined} />
        <Stat
          icon="spark"
          label="Page click rate"
          value={views ? `${Math.round((pageClicks / views) * 100)}%` : "—"}
          hint="Clicks from your page ÷ views"
        />
      </div>

      <section className="surface p-5">
        <h2 className="mb-4 text-sm font-medium">Clicks per day</h2>
        <div className="flex h-44 items-end gap-[2px]" role="img" aria-label={`${total} clicks over ${days} days`}>
          {bars.map((bar) => (
            <div key={bar.time} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-paper/80 transition-colors group-hover:bg-paper"
                style={{ height: `${Math.max(bar.clicks ? 4 : 1, (bar.clicks / peak) * 100)}%`, opacity: bar.clicks ? 1 : 0.25 }}
              />
              <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-paper px-2 py-1 text-xs text-night group-hover:block">
                {DAY.format(bar.time)} · {bar.clicks}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-mute">
          <span>{DAY.format(bars[0].time)}</span>
          <span>Today</span>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {!selected ? (
          <Breakdown
            title="Top links"
            rows={top.map(({ link, clicks }) => ({
              value: link.title,
              clicks,
              href: `/dashboard/analytics?range=${range}&link=${link.id}`,
            }))}
          />
        ) : null}
        <Breakdown title="Referrers" rows={referrers} />
        <Breakdown title="Countries" rows={countries.map((row) => ({ ...row, value: countryName(row.value) }))} />
        <Breakdown title="Devices" rows={devices} />
        <Breakdown
          title="Where clicks came from"
          rows={sources.map((row) => ({ ...row, value: row.value === "page" ? "My page" : "Short link" }))}
        />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: IconName; label: string; value: number | string; hint?: string }) {
  return (
    <div className="surface p-5">
      <p className="flex items-center gap-2 text-sm text-mute">
        <Icon name={icon} size={16} />
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">
        {typeof value === "number" ? value.toLocaleString("en") : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { value: string; clicks: number; href?: string }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.clicks));
  return (
    <section className="surface p-5">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {rows.length ? (
        <ul className="flex flex-col gap-1.5">
          {rows.map((row) => {
            const inner = (
              <>
                <span className="absolute inset-y-0 left-0 rounded-lg bg-line/70" style={{ width: `${(row.clicks / max) * 100}%` }} />
                <span className="relative truncate">{row.value}</span>
                <span className="relative shrink-0 tabular-nums text-mute">{row.clicks.toLocaleString("en")}</span>
              </>
            );
            const className = "relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-1.5 text-sm";
            return (
              <li key={row.value}>
                {row.href ? (
                  <Link href={row.href} className={`${className} hover:bg-night`}>
                    {inner}
                  </Link>
                ) : (
                  <div className={className}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-mute">No clicks yet.</p>
      )}
    </section>
  );
}
