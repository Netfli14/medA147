import { createContext, useContext, ReactNode } from "react";
import { useUser, useClerk } from "@clerk/react";

interface AuthContextType {
  user: { id: string; email: string | null; user_metadata: { display_name?: string } } | null;
  session: null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const mappedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        user_metadata: {
          display_name: user.fullName ?? user.username ?? undefined,
        },
      }
    : null;

  const signOut = async () => {
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider value={{ user: mappedUser, session: null, loading: !isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
