export function SearchBar({ value = "" }: { value?: string }) {
  return (
    <form action="/" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder="Search tonight"
        className="w-full border border-line bg-ink px-3 py-2 text-sm text-paper outline-none placeholder:text-mute focus:border-smile"
      />
    </form>
  );
}
