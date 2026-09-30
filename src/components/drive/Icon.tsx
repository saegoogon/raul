const PATHS = {
  folder: "M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2h8.8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z",
  file: "M6 3h8l4 4v14H6zM14 3v4h4",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5a1 1 0 1 0 0-.01",
  video: "M4 6h11v12H4zM15 10l5-3v10l-5-3",
  audio: "M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  pdf: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 16h6M9 10h2",
  text: "M6 3h8l4 4v14H6zM14 3v4h4M9 11h6M9 14h6M9 17h4",
  archive: "M6 3h12v18H6zM12 3v2M12 7v2M12 11v2M11 14h2v3h-2z",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  plus: "M12 5v14M5 12h14",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M4 6h16M4 12h16M4 18h16",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  share: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  download: "M12 4v12M7 11l5 5 5-5M4 20h16",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  close: "M6 6l12 12M18 6L6 18",
  home: "M3 11l9-7 9 7M5 10v10h14V10",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  move: "M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l2 2h8.8A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zM10 13.5h6M13.5 11l2.5 2.5-2.5 2.5",
  rename: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3zM13.5 7.5l3 3",
  restore: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
  check: "M5 12l5 5 9-10",
  cloud: "M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z",
  menu: "M4 7h16M4 12h16M4 17h16",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className,
  filled = false,
}: {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
