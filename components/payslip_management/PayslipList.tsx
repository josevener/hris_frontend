"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { PayslipSortKey } from "@/types/payslip";
import { usePayslipData } from "@/hooks/usePayslipData";
import { PayslipTable } from "./PayslipTable";
import { UserRole } from "@/types/employee";

const PayslipList: React.FC<{ userRole?: UserRole }> = () => {
  const { payslips, loading: dataLoading, error } = usePayslipData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: PayslipSortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isLoading = dataLoading;

  const handleSort = (key: PayslipSortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedPayslips = useMemo(() => {
    let result = [...payslips];
    if (searchTerm) {
      result = result.filter((p) =>
        [
          p.employee?.user?.lastname ?? "",
          p.employee?.user?.firstname ?? "",
          p.payroll_cycle?.start_date ?? "",
          p.payroll_cycle?.end_date ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        switch (sortConfig.key) {
          case "employee.user.lastname":
            aValue = a.employee?.user?.lastname ?? "";
            bValue = b.employee?.user?.lastname ?? "";
            break;
          case "payroll_cycle.pay_date":
            aValue = a.payroll_cycle?.pay_date ?? "";
            bValue = b.payroll_cycle?.pay_date ?? "";
            break;
          case "gross_salary":
            aValue = a.gross_salary;
            bValue = b.gross_salary;
            break;
          case "net_salary":
            aValue = a.net_salary;
            bValue = b.net_salary;
            break;
          case "issued_date":
            aValue = a.issued_date ?? "";
            bValue = b.issued_date ?? "";
            break;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        const aNum = typeof aValue === "number" ? aValue : 0;
        const bNum = typeof bValue === "number" ? bValue : 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      });
    }
    return result;
  }, [payslips, searchTerm, sortConfig]);

  const paginatedPayslips = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPayslips.slice(start, start + itemsPerPage);
  }, [filteredAndSortedPayslips, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPayslips.length / itemsPerPage);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Payslips</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search payslips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <PayslipTable
        payslips={paginatedPayslips}
        loading={isLoading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        itemsPerPage={itemsPerPage}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-foreground">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayslipList;