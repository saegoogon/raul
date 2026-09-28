export function isInAppBrowser(ua = "") {
  const x = ua.toLowerCase();
  return (
    x.includes("kakaotalk") ||
    x.includes("instagram") ||
    x.includes("fbav") ||
    x.includes("fban") ||
    x.includes("line/") ||
    x.includes("naver(") ||
    x.includes("naver/")
  );
}

export function isLinkScraper(ua = "") {
  return /kakaotalk-scrap|kakaobot|twitterbot|facebookexternalhit|slackbot|linkedinbot|discordbot|whatsapp|telegrambot|googlebot|bingbot|embedly|ia_archiver/i.test(
    ua,
  );
}
