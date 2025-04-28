"use client";

import TimeClock from "@/components/time_clock_management/TimeClock";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function TimeClockPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          BFD Corp
        </h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 text-red-500 dark:text-red-400 border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pb-16 overflow-hidden">
        <TimeClock />
      </main>
    </div>
  );
}