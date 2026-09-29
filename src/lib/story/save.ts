import { SAVE_KEY, type StorySave } from "@/lib/story/types";

export function readLocal(): StorySave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorySave;
    if (!parsed.nodeId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocal(save: StorySave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // ignore
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function hasLocalSave() {
  return !!readLocal();
}
