import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-mute">
        <Icon name="search" size={30} />
      </div>
      <h1 className="text-2xl font-semibold">Nothing here</h1>
      <p className="max-w-xs text-sm text-mute">This page doesn&apos;t exist or the username was changed.</p>
      <Link href="/" className="btn-primary mt-2">
        Go home
      </Link>
    </div>
  );
}
