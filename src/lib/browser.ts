export function isLinkScraper(ua = "") {
  return /kakaotalk-scrap|kakaobot|twitterbot|facebookexternalhit|slackbot|linkedinbot|discordbot|whatsapp|telegrambot|googlebot|bingbot|embedly|ia_archiver/i.test(
    ua,
  );
}
