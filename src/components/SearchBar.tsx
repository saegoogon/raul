export function SearchBar({ value = "" }: { value?: string }) {
  return (
    <form action="/" className="w-full">
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder="Search tonight"
        className="field text-sm placeholder:text-mute"
      />
    </form>
  );
}
