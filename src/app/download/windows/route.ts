import { NextResponse } from "next/server";
import { installerInfo, remoteInstallerUrl } from "@/lib/agent-download";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const local = installerInfo();
  if (local) return NextResponse.redirect(new URL(local.href, origin), 302);

  const remote = remoteInstallerUrl();
  if (remote) return NextResponse.redirect(remote, 302);

  return NextResponse.redirect(new URL("/?need=1", origin), 302);
}
