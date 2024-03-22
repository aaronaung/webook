import { createContext, useContext, useEffect, useState } from "react";

import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supaClientComponentClient } from "../data/clients/browser";
import { toDbUser } from "../data/user";
import { Tables } from "@/types/db";

export const AuthContext = createContext<{
  user: Tables<"users"> | null;
  session: Session | null;
}>({
  user: null,
  session: null,
});

export const AuthContextProvider = (props: { children: React.ReactNode }) => {
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Tables<"users"> | null>(null);

  const supabase = supaClientComponentClient();

  const redirectToLoginIfUnauthed = (
    session: Session | null,
    event?: AuthChangeEvent,
  ) => {
    const returnPath = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    if (
      (event && event === "SIGNED_OUT") ||
      (!session?.user && !window.location.href.includes("/login"))
    ) {
      window.location.href = `/login?return_path=${returnPath}`;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      redirectToLoginIfUnauthed(session);
      const dbUser = await toDbUser(session?.user, { client: supabase });
      setUserSession(session);
      setUser(dbUser);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        redirectToLoginIfUnauthed(session, event);
        const dbUser = await toDbUser(session?.user, { client: supabase });
        setUserSession(session);
        setUser(dbUser);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session: userSession,
    user,
  };
  return <AuthContext.Provider value={value} {...props} />;
};

export const useAuthUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a AuthContextProvider.");
  }

  return context;
};
