import { SmileMark } from "@/components/SmileMark";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <SmileMark className="h-12 w-12 text-smile" />
      <p className="mt-4">
        <BrandMark />
      </p>
      <h1 className="mt-2 text-xl">Page not found</h1>
      <p className="mt-2 text-sm text-mute">This moment is gone, or the link is wrong.</p>
      <a
        href="/"
        className="mt-6 border border-smile bg-smile px-3 py-1.5 text-sm text-night"
      >
        Back to tonight
      </a>
    </div>
  );
}
