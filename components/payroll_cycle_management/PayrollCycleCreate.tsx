"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { apiFetch } from "@/services/api/apiPayrollCycle";

export function PayrollCycleCreate() {
  const [startDay, setStartDay] = useState("1");
  const [endDay, setEndDay] = useState("15");
  const [secondStartDay, setSecondStartDay] = useState("16");
  const [secondEndDay, setSecondEndDay] = useState("30");
  const [payDateOffset, setPayDateOffset] = useState("3");
  const [startYearMonth, setStartYearMonth] = useState("2025-03");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const startDayNum = parseInt(startDay, 10);
    const endDayNum = parseInt(endDay, 10);
    const secondStartDayNum = parseInt(secondStartDay, 10);
    const secondEndDayNum = parseInt(secondEndDay, 10);
    const offset = parseInt(payDateOffset, 10);

    if (
      isNaN(startDayNum) || isNaN(endDayNum) ||
      isNaN(secondStartDayNum) || isNaN(secondEndDayNum) ||
      isNaN(offset) || startDayNum < 1 || endDayNum > 31 ||
      secondStartDayNum < 1 || secondEndDayNum > 31 ||
      startDayNum > endDayNum || secondStartDayNum > secondEndDayNum ||
      endDayNum >= secondStartDayNum || offset < 0
    ) {
      toast.error("Invalid day range or offset.");
      return;
    }

    setIsLoading(true);
    try {
      const configData = {
        start_year_month: startYearMonth,
        first_start_day: startDayNum,
        first_end_day: endDayNum,
        second_start_day: secondStartDayNum,
        second_end_day: secondEndDayNum,
        pay_date_offset: offset,
      };
      await apiFetch("/payroll-config", "POST", configData);
      toast.success("Payroll cycle created successfully!");
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to create payroll cycle");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStartYearMonth("2025-03");
    setStartDay("1");
    setEndDay("15");
    setSecondStartDay("16");
    setSecondEndDay("30");
    setPayDateOffset("3");
  };

  return (
    <Card className="w-full max-w-5xl bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white">Create Payroll Cycle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="dark:text-gray-200">Start Year-Month</Label>
            <Input
              type="month"
              value={startYearMonth}
              onChange={(e) => setStartYearMonth(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">First Cycle Start</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">First Cycle End</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">Second Cycle Start</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={secondStartDay}
              onChange={(e) => setSecondStartDay(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">Second Cycle End</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={secondEndDay}
              onChange={(e) => setSecondEndDay(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">Pay Date Offset (Days)</Label>
            <Input
              type="number"
              min="0"
              value={payDateOffset}
              onChange={(e) => setPayDateOffset(e.target.value)}
              className="mt-1 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isLoading}
          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </CardContent>
    </Card>
  );
}