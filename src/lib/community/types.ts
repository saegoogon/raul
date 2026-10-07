export type Room = {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  score: number;
  commentCount: number;
  createdAt: string;
  room: { slug: string; name: string };
  author: { username: string };
  myVote: number;
};

export type Comment = {
  id: string;
  body: string;
  score: number;
  createdAt: string;
  parentId: string | null;
  author: { username: string };
  myVote: number;
};

export type FeedSort = "hot" | "new";
