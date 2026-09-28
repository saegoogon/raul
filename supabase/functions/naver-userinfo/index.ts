const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

Deno.serve(async (req: Request) => {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const naverResponse = await fetch(NAVER_USERINFO_URL, {
    headers: { Authorization: authorization },
  });

  if (!naverResponse.ok) {
    return Response.json(
      { error: "Failed to fetch user info from Naver" },
      { status: naverResponse.status },
    );
  }

  const data = await naverResponse.json();
  const profile = data.response ?? {};

  return Response.json({
    sub: String(profile.id ?? ""),
    email: profile.email ?? "",
    email_verified: true,
    name: profile.name ?? profile.nickname ?? "",
    nickname: profile.nickname ?? "",
    preferred_username: profile.nickname ?? profile.name ?? "",
    picture: profile.profile_image ?? "",
  });
});
