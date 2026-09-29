export type Pose = "sit" | "stand" | "wait" | "sleep" | "none";

export type CastId =
  | "player"
  | "nyang"
  | "jenny"
  | "flower"
  | "hider"
  | "slime"
  | "merchant"
  | "ghost"
  | "girl"
  | "joker"
  | "skeleton"
  | "flame"
  | "tvman"
  | "white-king"
  | "black-queen";

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
  who?: CastId;
  speaker?: string;
  text: string;
  next?: string;
  choices?: StoryChoice[];
  encounter?: {
    name: string;
    who?: CastId;
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
export const SAVE_KEY = "blacksmile-story-v2";
export const TRUE_NIGHT_PRODUCT = "true-night";
