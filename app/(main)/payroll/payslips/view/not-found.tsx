"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Payslip Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        The requested payslip could not be found.
      </p>
      <Button asChild className="dark:bg-gray-700 dark:hover:bg-gray-600">
        <Link href="/payroll/payslips">Back to Payslips</Link>
      </Button>
    </div>
  );
}