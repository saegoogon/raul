export function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error?.message) return false;
  return /schema cache|does not exist|could not find the table/i.test(error.message);
}
