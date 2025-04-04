"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/services/api/apiPayrollCycle";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PayrollConfigUpdate() {
  const [configId, setConfigId] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [secondStartDay, setSecondStartDay] = useState("");
  const [secondEndDay, setSecondEndDay] = useState("");
  const [payDateOffset, setPayDateOffset] = useState("");
  const [startYearMonth, setStartYearMonth] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!configId) {
      toast.error("Configuration ID is required.");
      return;
    }

    const startDayNum = startDay ? parseInt(startDay, 10) : undefined;
    const endDayNum = endDay ? parseInt(endDay, 10) : undefined;
    const secondStartDayNum = secondStartDay ? parseInt(secondStartDay, 10) : undefined;
    const secondEndDayNum = secondEndDay ? parseInt(secondEndDay, 10) : undefined;
    const offset = payDateOffset ? parseInt(payDateOffset, 10) : undefined;

    if (
      (startDayNum && (isNaN(startDayNum) || startDayNum < 1 || startDayNum > 31)) ||
      (endDayNum && (isNaN(endDayNum) || endDayNum < 1 || endDayNum > 31)) ||
      (secondStartDayNum && (isNaN(secondStartDayNum) || secondStartDayNum < 1 || secondStartDayNum > 31)) ||
      (secondEndDayNum && (isNaN(secondEndDayNum) || secondEndDayNum < 1 || secondEndDayNum > 31)) ||
      (offset && (isNaN(offset) || offset < 0)) ||
      (startDayNum && endDayNum && startDayNum > endDayNum) ||
      (secondStartDayNum && secondEndDayNum && secondStartDayNum > secondEndDayNum) ||
      (endDayNum && secondStartDayNum && endDayNum >= secondStartDayNum)
    ) {
      toast.error("Invalid day range or offset.");
      return;
    }

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configData: any = {};
      if (startYearMonth) configData.start_year_month = startYearMonth;
      if (startDayNum) configData.first_start_day = startDayNum;
      if (endDayNum) configData.first_end_day = endDayNum;
      if (secondStartDayNum) configData.second_start_day = secondStartDayNum;
      if (secondEndDayNum) configData.second_end_day = secondEndDayNum;
      if (offset) configData.pay_date_offset = offset;

      await apiFetch(`/payroll-config/${configId}`, "PUT", configData);
      toast.success("Payroll cycle updated successfully!");
      resetForm();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update payroll cycle");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setConfigId("");
    setStartYearMonth("");
    setStartDay("");
    setEndDay("");
    setSecondStartDay("");
    setSecondEndDay("");
    setPayDateOffset("");
  };

  return (
    <Card className="w-full max-w-5xl bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white">Update Payroll Cycle</CardTitle>
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
          onClick={handleUpdate}
          disabled={isLoading}
          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </CardContent>
    </Card>
  );
}