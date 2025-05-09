"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/lib/AuthContext";
import api from "@/lib/axios";
import { User } from "@/types/employee";

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User[] | null>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await api.get("/api/auth-data");
        // console.log("Fetched auth data:", response.data);
        setToken(response.data.token);
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch auth data", error);
        setToken(null);
        setUser(null);
      } finally {
        // setLoading(false);
      }
    };
    
    fetchAuthData();
  }, []);

  // Render children even while loading to avoid blocking
  return (
    <AuthProvider initialToken={token} initialUser={user}>
      {children}
    </AuthProvider>
  );
}