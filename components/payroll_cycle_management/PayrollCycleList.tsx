"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/services/api/apiPayrollCycle";
import { toast } from "sonner";
import { PayrollConfig } from "@/types/payroll";
import { PayrollCycleCreate } from "./PayrollCycleCreate";

export function PayrollCycleList() {
  const [configs, setConfigs] = useState<PayrollConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch<PayrollConfig[]>("/payroll-config", "GET");
      setConfigs(response);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payroll cycles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData: any) => {
    setIsCreating(true);
    try {
      await apiFetch("/payroll-config", "POST", {
        ...formData,
        first_start_day: parseInt(formData.first_start_day, 10),
        first_end_day: parseInt(formData.first_end_day, 10),
        second_start_day: parseInt(formData.second_start_day, 10),
        second_end_day: parseInt(formData.second_end_day, 10),
        pay_date_offset: parseInt(formData.pay_date_offset, 10),
      });
      toast.success("Payroll cycle created successfully!");
      setIsModalOpen(false);
      fetchConfigs();
    } catch (err: any) {
      toast.error(err.message || "Failed to create payroll cycle");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold dark:text-white">Payroll Cycle List</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Payroll Cycle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payroll Cycle</DialogTitle>
            </DialogHeader>
            <PayrollCycleCreate onCreate={handleCreate} isCreating={isCreating} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="dark:bg-gray-700">
              <TableHead className="dark:text-gray-200">ID</TableHead>
              <TableHead className="dark:text-gray-200">Start Year-Month</TableHead>
              <TableHead className="dark:text-gray-200">First Cycle</TableHead>
              <TableHead className="dark:text-gray-200">Second Cycle</TableHead>
              <TableHead className="dark:text-gray-200">Offset</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="dark:bg-gray-800">
                  <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 dark:bg-gray-600" /></TableCell>
                </TableRow>
              ))
            ) : configs.length > 0 ? (
              configs.map((config) => (
                <TableRow key={config.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
                  <TableCell className="dark:text-gray-200">{config.id}</TableCell>
                  <TableCell className="dark:text-gray-200">{config.start_year_month}</TableCell>
                  <TableCell className="dark:text-gray-200">{`${config.first_start_day}-${config.first_end_day}`}</TableCell>
                  <TableCell className="dark:text-gray-200">{`${config.second_start_day}-${config.second_end_day}`}</TableCell>
                  <TableCell className="dark:text-gray-200">{config.pay_date_offset}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="dark:bg-gray-800">
                <TableCell colSpan={5} className="text-center dark:text-gray-300">No payroll cycles found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
