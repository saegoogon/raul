export function tonightRange(now = new Date()) {
  const end = new Date(now.getTime() + 1000);
  const start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  return { start, end };
}

const PROMPTS = [
  { en: "The light in your room right now", ko: "지금 방 안의 빛" },
  { en: "Something you just finished", ko: "방금 막 끝난 것" },
  { en: "The view from where you sit", ko: "지금 앉은 자리에서 보이는 것" },
  { en: "What you ate, unposed", ko: "방금 먹은 것, 꾸미지 말고" },
  { en: "A quiet corner nobody sees", ko: "아무도 안 보는 구석" },
  { en: "Your hands, doing anything", ko: "지금 하는 중인 손" },
  { en: "The last thing that made you pause", ko: "잠깐 멈추게 한 것" },
  { en: "Outside your window tonight", ko: "오늘 밤 창밖" },
  { en: "A small mess that is yours", ko: "나만의 작은 어질러짐" },
  { en: "Someone or something waiting with you", ko: "지금 같이 있는 것" },
  { en: "The shoes you took off", ko: "벗은 신발" },
  { en: "One color in this room", ko: "이 방의 색 하나" },
  { en: "What midnight looks like for you", ko: "당신에게 밤이 보이는 모습" },
  { en: "A sound you would photograph", ko: "사진으로 남기고 싶은 소리" },
] as const;

export function tonightPrompt(now = new Date()) {
  const day = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );
  return PROMPTS[((day % PROMPTS.length) + PROMPTS.length) % PROMPTS.length];
}
