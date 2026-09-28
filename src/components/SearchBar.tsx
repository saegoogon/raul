export function SearchBar({ value = "" }: { value?: string }) {
  return (
    <form action="/" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder="Search moments / 검색"
        className="w-full rounded-full border border-line bg-ink px-4 py-2 text-sm text-paper outline-none placeholder:text-mute focus:border-smile"
      />
    </form>
  );
}
