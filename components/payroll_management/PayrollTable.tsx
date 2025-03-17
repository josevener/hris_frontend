"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import { Payroll, SortKey, PayrollItem } from "@/types/payroll";
import { ChevronUp, ChevronDown, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface PayrollTableProps {
  payrolls: Payroll[];
  payrollItems: PayrollItem[];
  loading: boolean;
  handleEdit: (payroll: Payroll) => void;
  handleDelete: (payroll: Payroll) => void;
  handleViewPayroll: (payroll: Payroll) => void;
  userRole: UserRole;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  itemsPerPage: number;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls,
  payrollItems,
  loading,
  handleViewPayroll,
  sortConfig,
  handleSort,
  itemsPerPage,
}) => {
  const SortIcon = ({ column }: { column: SortKey }) =>
    sortConfig?.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 inline" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4 inline" />
      )
    ) : null;

  const getFullName = (payroll: Payroll): string => {
    const employee = payroll.employee;
    if (!employee || !employee.user) {
      console.warn(`Missing employee or user data for payroll ID ${payroll.id}. Employee ID: ${payroll.employee_id}`, payroll);
      return `Employee #${payroll.employee_id}`;
    }
    const { user } = employee;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const formatCurrency = (value: number | undefined): string => {
    return value !== undefined
      ? value.toLocaleString("en-US", { style: "currency", currency: "PHP", maximumFractionDigits: 2 })
      : "N/A";
  };

  const formatDate = (date: string | undefined): string => {
    return date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";
  };

  const getPayrollPeriod = (payroll: Payroll): string => {
    const itemsForPayroll = payrollItems.filter((item) => item.payroll_id === payroll.id);
    if (itemsForPayroll.length === 0) return "No Items";

    const validItems = itemsForPayroll.filter((item) => item.start_date && item.end_date);
    if (validItems.length === 0) return "Not Assigned";

    const startDates = validItems.map((item) => new Date(item.start_date!));
    const endDates = validItems.map((item) => new Date(item.end_date!));
    const earliestStart = new Date(Math.min(...startDates.map((d) => d.getTime())));
    const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

    try {
      return `${format(earliestStart, "MMM dd, yyyy")} to ${format(latestEnd, "MMM dd, yyyy")}`;
    } catch (e) {
      console.warn(`Invalid date format for payroll ID ${payroll.id}:`, e);
      return "Invalid Period";
    }
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="dark:text-gray-300">Comprehensive payroll management directory.</TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] cursor-pointer dark:text-gray-200" onClick={() => handleSort("id")}>
            ID <SortIcon column="id" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("employee.user.lastname")}>
            Employee <SortIcon column="employee.user.lastname" />
          </TableHead>
          <TableHead className="dark:text-gray-200">Payroll Period</TableHead>
          <TableHead className="dark:text-gray-200">Total Earnings</TableHead>
          <TableHead className="dark:text-gray-200">Total Deductions</TableHead>
          <TableHead className="dark:text-gray-200">Net Salary</TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("pay_date")}>
            Pay Date <SortIcon column="pay_date" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("status")}>
            Status <SortIcon column="status" />
          </TableHead>
          <TableHead className="w-[150px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : payrolls.length > 0 ? (
          payrolls.map((payroll, index) => (
            <TableRow key={payroll.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(payroll)}</TableCell>
              <TableCell className="dark:text-gray-200">{getPayrollPeriod(payroll)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.total_earnings)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.total_deductions)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.net_salary)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatDate(payroll.pay_date)}</TableCell>
              <TableCell className="dark:text-gray-200">{payroll.status}</TableCell>
              <TableCell className="text-center">
                <Button  onClick={() => handleViewPayroll(payroll)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                  <Eye className="h-4 w-4" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800"><TableCell colSpan={9} className="text-center dark:text-gray-300">No payrolls available</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PayrollTable;