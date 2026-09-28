import { SmileMark } from "@/components/SmileMark";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <SmileMark className="h-16 w-16 text-smile" />
      <p className="mt-6 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="font-display mt-3 text-3xl italic tracking-tight sm:text-4xl">
        Lost in the dark
      </h1>
      <p className="mt-3 text-sm text-mute">
        This moment is gone.
        <br />
        이 길은 어둠 속에서 끝났어요.
      </p>
      <a
        href="/"
        className="mt-8 rounded-full bg-smile px-5 py-2 text-sm font-semibold text-night hover:bg-amber-200"
      >
        Back to tonight
      </a>
    </div>
  );
}
