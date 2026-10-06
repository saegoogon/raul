import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-24 md:px-10">
      <p className="text-sm text-mute">Blacky</p>
      <h1 className="mt-3 text-lg font-medium">This page isn&apos;t here.</h1>
      <p className="mt-3 max-w-xs text-sm text-mute">Maybe the address moved. I can take you back.</p>
      <Link href="/" className="btn-ghost mt-8 w-fit px-0">
        Go home
      </Link>
    </div>
  );
}
