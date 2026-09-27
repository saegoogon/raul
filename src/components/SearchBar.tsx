export function SearchBar({ value = "" }: { value?: string }) {
  return (
    <form action="/" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder="Search moments / 검색"
        className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </form>
  );
}
