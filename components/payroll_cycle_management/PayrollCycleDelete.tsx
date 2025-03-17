"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/services/api/apiPayrollCycle";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PayrollCycleDelete() {
  const [configId, setConfigId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!configId) {
      toast.error("Configuration ID is required.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch(`/payroll-config/${configId}`, "DELETE");
      toast.success("Payroll cycle deleted successfully!");
      setConfigId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete payroll cycle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white">Delete Payroll Cycle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="dark:text-gray-200">Configuration ID</Label>
          <Input
            value={configId}
            onChange={(e) => setConfigId(e.target.value)}
            className="mt-1 dark:bg-gray-700 dark:text-white"
            placeholder="Enter config ID"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleDelete}
          disabled={isLoading}
          variant="destructive"
          className="dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </CardContent>
    </Card>
  );
}