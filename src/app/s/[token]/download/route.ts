import { NextResponse } from "next/server";
import { DRIVE_BUCKET } from "@/lib/drive";
import { sharedItem } from "@/lib/share";

export async function GET(request: Request, { params }: RouteContext<"/s/[token]/download">) {
  const { token } = await params;
  const id = new URL(request.url).searchParams.get("id") ?? undefined;
  const shared = await sharedItem(token, id);
  if (!shared || shared.target.kind !== "file" || !shared.target.storage_path) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { data } = await shared.admin.storage
    .from(DRIVE_BUCKET)
    .createSignedUrl(shared.target.storage_path, 60, { download: shared.target.name });
  if (!data?.signedUrl) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl, 302);
}
