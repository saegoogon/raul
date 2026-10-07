export type CartLine = {
  key: string;
  productId: string;
  option: string | null;
  qty: number;
  selected: boolean;
};

export type SavedItem = {
  productId: string;
  addedAt: number;
};

export type LocalOrder = {
  id: string;
  createdAt: number;
  lines: { productId: string; option: string | null; qty: number; price: number; name: string }[];
  total: number;
  note: string;
};
