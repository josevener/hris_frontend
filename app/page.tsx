"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, []);

  return (
    <div>
      <h1>BFD Corporation</h1>
    </div>
  );
}
