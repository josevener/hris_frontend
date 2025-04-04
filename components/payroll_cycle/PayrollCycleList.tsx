"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/services/api/apiPayrollCycle";
import { toast } from "sonner";
import { PayrollCycle } from "@/types/payroll";
import { format } from "date-fns";

interface PaginatedResponse {
  cycles: PayrollCycle[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export function PayrollCycleList() {
  const [cycles, setCycles] = useState<PayrollCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [perPage] = useState(5);

  useEffect(() => {
    fetchCycles(currentPage);
  }, [currentPage]);

  const fetchCycles = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await apiFetch<PaginatedResponse>(
        `/payroll-cycles?page=${page}&per_page=${perPage}`,
        "GET"
      );
      setCycles(response.cycles);
      setTotalPages(response.last_page);
      setTotalItems(response.total);
      setFrom(response.from);
      setTo(response.to);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to load payroll cycles");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Check if a cycle is current based on today's date
  const isCurrentCycle = (cycle: PayrollCycle) => {
    const today = new Date();
    return (
      new Date(cycle.start_date) <= today &&
      new Date(cycle.end_date) >= today
    );
  };

  return (
    <Card className="w-full max-w-5xl bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold dark:text-white">Payroll Cycles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Current cycle (if any) appears at the top
        </div>
        <Table>
          <TableHeader>
            <TableRow className="dark:bg-gray-700">
              <TableHead className="dark:text-gray-200">ID</TableHead>
              <TableHead className="dark:text-gray-200">Start Date</TableHead>
              <TableHead className="dark:text-gray-200">End Date</TableHead>
              <TableHead className="dark:text-gray-200">Pay Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="dark:bg-gray-800">
                  <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
                </TableRow>
              ))
            ) : cycles.length > 0 ? (
              cycles.map((cycle, index) => (
                <TableRow
                  key={cycle.id}
                  className={`dark:bg-gray-800 dark:hover:bg-gray-700 ${
                    index === 0 && isCurrentCycle(cycle) ? "bg-green-100 dark:bg-green-900" : ""
                  }`}
                >
                  <TableCell className="dark:text-gray-200">
                    {cycle.id}
                    {index === 0 && isCurrentCycle(cycle) && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-300">
                        (Current)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {format(new Date(cycle.start_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {format(new Date(cycle.end_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {format(new Date(cycle.pay_date), "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="dark:bg-gray-800">
                <TableCell colSpan={4} className="text-center dark:text-gray-300">
                  No payroll cycles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="dark:text-gray-200">
            Showing {from}-{to} of {totalItems} (Page {currentPage} of {totalPages})
          </span>
          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}