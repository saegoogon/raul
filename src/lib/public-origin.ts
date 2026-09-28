export function publicOrigin(request: Request) {
  const { origin } = new URL(request.url);
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (process.env.NODE_ENV !== "development" && host) {
    return `${proto}://${host}`;
  }
  return origin;
}
