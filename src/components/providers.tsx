"use client";

import type { ReactNode } from "react";
import { SearchProvider } from "@/components/search/SearchProvider";

export function Providers({ children }: { children: ReactNode }) {
  return <SearchProvider>{children}</SearchProvider>;
}
