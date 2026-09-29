export type Pose = "sit" | "stand" | "wait" | "sleep" | "none";

export type StoryChoice = {
  label: string;
  next: string;
  set?: string;
};

export type StoryAct = {
  label: string;
  text: string;
  meter?: number;
  set?: string;
};

export type StoryNode = {
  id: string;
  pose?: Pose;
  speaker?: string;
  text: string;
  next?: string;
  choices?: StoryChoice[];
  encounter?: {
    name: string;
    spareAt: number;
    acts: StoryAct[];
    spare: StoryChoice;
    leave: StoryChoice;
  };
  shop?: boolean;
  paid?: boolean;
  ending?: boolean;
};

export type StorySave = {
  nodeId: string;
  flags: string[];
  meter: number;
};

export const STORY_START = "n1";
export const SAVE_KEY = "blacksmile-story";
export const TRUE_NIGHT_PRODUCT = "true-night";
