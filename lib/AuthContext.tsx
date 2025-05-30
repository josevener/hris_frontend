"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "./axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
  initialToken,
  initialUser,
}: {
  children: React.ReactNode;
  initialToken: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialUser: any | null;
}) {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(initialUser);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(!initialToken || !initialUser);

  useEffect(() => {
    // console.log("AuthContext - Initial token:", initialToken, "Initial user:", initialUser);
    const syncAuth = async () => {
      if (!initialToken || !initialUser) {
        // console.log("No initial data, syncing with /api/auth-data");
        try {
          const response = await api.get("/api/auth-data");
          console.log("Axios auth data:", response.data);
          setToken(response.data.token);
          setUser(response.data.user);
        } catch (error) {
          console.error("Axios sync error:", error);
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // console.log("Initial data present, no sync needed");
        setLoading(false); // Set loading false first
      }
    };
    syncAuth();
  }, [initialToken, initialUser]); // Depend on initial props

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const login = async (newToken: string, newUser: any) => {
    // console.log("Login - Token:", newToken, "User:", newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    // console.log("Logging out");
    setToken(null);
    setUser(null);
    try {
      await api.post("/api/logout");
      // console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);