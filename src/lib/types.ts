export type Profile = {
  id: string;
  username: string;
  created_at: string;
};

export type RankEntry = {
  userId: string;
  username: string;
  rank: number;
  score: number;
  winks: number;
};
