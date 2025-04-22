"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-red-500 dark:text-red-400 mb-4">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button
        onClick={reset}
        className="dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
      >
        Try Again
      </Button>
    </div>
  );
}