export function isMissingTable(error: { message?: string; code?: string } | null) {
  if (!error?.message) return false;
  return /schema cache|does not exist|could not find the table/i.test(error.message);
}

export function isQueryError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "PGRST201" || /embed|relationship was found/i.test(error.message ?? "");
}
