"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("AuthProtectedLayout - Token:", token, "Loading:", loading);
    if (!loading && !token) {
      console.log("No token in AuthProtectedLayout, redirecting to /login");
      router.push("/login");
    }
  }, [token, loading, router]);

  // if (loading) {
  //   console.log("AuthProtectedLayout - Rendering loading state");
  //   return <div>Loading...</div>;
  // }

  if (!token) {
    console.log("AuthProtectedLayout - No token, rendering null");
    return null;
  }

  return <>{children}</>;
}