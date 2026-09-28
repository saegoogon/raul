"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  userId: string | null;
  username: string | null;
};

const AuthContext = createContext<AuthState>({
  userId: null,
  username: null,
});
const ClockContext = createContext(0);

export function Providers({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    userId: null,
    username: null,
  });
  const [now, setNow] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    let lastId: string | null | undefined;
    const load = async (userId?: string) => {
      const next = userId ?? null;
      if (lastId === next) return;
      lastId = next;
      if (!next) {
        setAuth({ userId: null, username: null });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", next)
        .single();
      setAuth({ userId: next, username: data?.username ?? null });
    };

    supabase.auth.getUser().then(({ data }) => void load(data.user?.id));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user?.id);
    });

    setNow(Date.now());
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(tick);
    };
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <ClockContext.Provider value={now}>{children}</ClockContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useClock() {
  return useContext(ClockContext);
}
