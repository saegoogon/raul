export type Profile = {
  id: string;
  username: string;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: Profile | null;
  vote_count?: number;
  user_vote?: number | null;
  comment_count?: number;
};

export type RankEntry = {
  userId: string;
  username: string;
  rank: number;
  score: number;
  smiles: number;
  posts: number;
  winks: number;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile | null;
};
