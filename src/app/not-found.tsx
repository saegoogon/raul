import { Mascot } from "@/components/Mascot";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="buddy-scene flex flex-col items-center px-4 py-16 text-center">
      <div className="buddy-stage">
        <Mascot size="xl" pose="sleep" priority className="buddy-breathe" />
        <span className="buddy-zzz" aria-hidden>
          z<span>z</span>
          <span>z</span>
        </span>
        <span className="buddy-shadow buddy-shadow-sleep" aria-hidden />
      </div>
      <p className="mt-6">
        <BrandMark />
      </p>
      <h1 className="mt-2 text-xl">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-mute">
        This moment is gone, or the link is wrong.
      </p>
      <a href="/" className="btn-primary mt-6 text-sm">
        Back to tonight
      </a>
    </div>
  );
}
