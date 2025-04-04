import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payroll, SortKey } from "@/types/payroll";
import PayrollActions from "./PayrollActions";
import { format } from "date-fns";
import { useMemo } from "react";

interface PayrollTableProps {
  payrolls: Payroll[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewPayroll: (payroll: Payroll) => void;
  itemsPerPage: number;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls,
  loading,
  sortConfig,
  handleSort,
  handleViewPayroll,
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

  const formatCurrency = (value: number | string | undefined): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value ?? 0;
    return numValue.toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
    });
  };

  const getFullName = (payroll: Payroll) =>
    payroll.employee?.user
      ? `${payroll.employee.user.firstname} ${payroll.employee.user.middlename ? payroll.employee.user.middlename[0] + "." : ""} ${payroll.employee.user.lastname}`.trim()
      : `Employee #${payroll.employee_id || "N/A"}`;

  const getPayrollPeriod = (payroll: Payroll) =>
    payroll.payroll_cycle
      ? `${format(new Date(payroll.payroll_cycle.start_date), "MMM dd")} - ${format(new Date(payroll.payroll_cycle.end_date), "MMM dd, yyyy")}`
      : "N/A";

  const getPayDate = (payroll: Payroll) =>
    payroll.payroll_cycle
      ? format(new Date(payroll.payroll_cycle.pay_date), "MMMM dd, yyyy")
      : "N/A";

  const getBasicSalary = (payroll: Payroll) =>
    payroll.salary ? formatCurrency(payroll.salary.basic_salary) : "N/A";

  const getTotalEarnings = (payroll: Payroll) => {
    const basicSalary = payroll.salary ? parseFloat(payroll.salary.basic_salary as unknown as string) : 0;
    const earnings = payroll.payroll_items
      ?.filter((item) => item.type === "earning")
      .reduce((sum, item) => sum + item.amount, 0) || 0;
    return formatCurrency(basicSalary + earnings);
  };

  const getTotalDeductions = (payroll: Payroll) => {
    const deductions = payroll.payroll_items
      ?.filter((item) => item.type === "deduction" || item.type === "contribution")
      .reduce((sum, item) => sum + item.amount, 0) || 0;
    return formatCurrency(deductions);
  };

  const getNetSalary = (payroll: Payroll) => {
    const basicSalary = payroll.salary ? parseFloat(payroll.salary.basic_salary as unknown as string) : 0;
    const earnings = payroll.payroll_items
      ?.filter((item) => item.type === "earning")
      .reduce((sum, item) => sum + item.amount, 0) || 0;
    const deductions = payroll.payroll_items
      ?.filter((item) => item.type === "deduction" || item.type === "contribution")
      .reduce((sum, item) => sum + item.amount, 0) || 0;
    return formatCurrency(basicSalary + earnings - deductions);
  };

  const renderKey = useMemo(() => Date.now(), []);

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive payroll management directory.
      </TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("employee.user.lastname")}
          >
            Employee <SortIcon column="employee.user.lastname" />
          </TableHead>
          <TableHead className="text-foreground dark:text-foreground">Payroll Period</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Pay Date</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Basic Salary</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Total Earnings</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Total Deductions</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Net Salary</TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("status")}
          >
            Status <SortIcon column="status" />
          </TableHead>
          <TableHead className="w-[100px] text-center text-foreground dark:text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }, (_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : payrolls.length > 0 ? (
          payrolls.map((payroll) => (
            <TableRow
              key={payroll.id ?? `temp-${Date.now()}`}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{getFullName(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getPayrollPeriod(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getPayDate(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getBasicSalary(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getTotalEarnings(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getTotalDeductions(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getNetSalary(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{payroll.status}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PayrollActions payroll={payroll} onView={handleViewPayroll} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={9} className="text-center text-muted-foreground dark:text-gray-300">
              No payrolls found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};