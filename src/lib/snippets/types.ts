import type { Language } from "@/lib/snippets/languages";

export type Snippet = {
  id: string;
  title: string;
  language: Language;
  code: string;
  note: string;
  starCount: number;
  commentCount: number;
  createdAt: string;
  author: { username: string };
  starred: boolean;
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  author: { username: string };
};

export type FeedSort = "hot" | "new";
