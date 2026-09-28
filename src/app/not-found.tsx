import { Mascot } from "@/components/Mascot";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <Mascot size="lg" bob />
      <p className="mt-4">
        <BrandMark />
      </p>
      <h1 className="mt-2 text-xl">Page not found</h1>
      <p className="mt-2 text-sm text-mute">This moment is gone, or the link is wrong.</p>
      <a href="/" className="btn-primary mt-6 text-sm">
        Back to tonight
      </a>
    </div>
  );
}
