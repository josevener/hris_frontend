import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payroll, SortKey } from "@/types/payroll";
import PayrollActions from "./PayrollActions";
import { format } from "date-fns";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface PayrollTableProps {
  payrolls: Payroll[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewPayroll: (payroll: Payroll) => void;
  itemsPerPage: number;
  onSelectionChange: (selectedIds: number[]) => void;
  selectedPayrollIds: number[];
}

export const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls,
  loading,
  sortConfig,
  handleSort,
  handleViewPayroll,
  itemsPerPage,
  onSelectionChange,
  selectedPayrollIds,
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
      maximumFractionDigits: 2,
    });
  };

  const getFullName = (payroll: Payroll) =>
    payroll.employee?.user
      ? `${payroll.employee.user.firstname} ${payroll.employee.user.middlename ? payroll.employee.user.middlename[0] + "." : ""} ${payroll.employee.user.lastname}`.trim()
      : `Employee #${payroll.employee_id || "N/A"}`;

  const getPayrollPeriod = (payroll: Payroll) =>
    payroll.payroll_cycle
      ? `${format(new Date(payroll.payroll_cycle.start_date), "MMMM dd")} - ${format(new Date(payroll.payroll_cycle.end_date), "MMMM dd, yyyy")}`
      : "N/A";

  const getGrossSalary = (payroll: Payroll) =>
    payroll.gross_salary !== undefined ? formatCurrency(payroll.gross_salary) : "N/A";

  const getPayDate = (payroll: Payroll) =>
    payroll.payroll_cycle
      ? format(new Date(payroll.payroll_cycle.pay_date), "MMMM dd, yyyy")
      : "N/A";

  const getBasicSalary = (payroll: Payroll) =>
    payroll.salary ? formatCurrency(payroll.salary.basic_salary) : "N/A";

  const getTotalEarnings = (payroll: Payroll) =>
    payroll.total_earnings !== undefined ? formatCurrency(payroll.total_earnings) : "N/A";

  const getTotalDeductions = (payroll: Payroll) =>
    payroll.total_deductions !== undefined ? formatCurrency(payroll.total_deductions) : "N/A";

  const getNetSalary = (payroll: Payroll) =>
    payroll.net_salary !== undefined ? formatCurrency(payroll.net_salary) : "N/A";

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCheckboxChange = (payrollId: number, checked: boolean) => {
    const newSelection = checked
      ? [...selectedPayrollIds, payrollId]
      : selectedPayrollIds.filter((id) => id !== payrollId);
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? payrolls.map((p) => p.id ?? 0).filter((id) => id !== 0) : [];
    onSelectionChange(newSelection);
  };

  const renderKey = useMemo(() => Date.now(), []);

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive payroll management directory.
      </TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] text-foreground dark:text-foreground">
            <Checkbox
              checked={selectedPayrollIds.length === payrolls.length && payrolls.length > 0}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("employee.user.lastname")}
          >
            Employee <SortIcon column="employee.user.lastname" />
          </TableHead>
          <TableHead className="text-foreground dark:text-foreground">Payroll Period</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Pay Date</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Basic Pay</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Total Earnings</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Total Deductions</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Gross Salary</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Net Salary</TableHead>
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
          Array.from({ length: itemsPerPage - 5 }, (_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-4 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
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
              <TableCell>
                <Checkbox
                  checked={selectedPayrollIds.includes(payroll.id ?? 0)}
                  onCheckedChange={(checked) => handleCheckboxChange(payroll.id ?? 0, checked as boolean)}
                  disabled={!payroll.id}
                />
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getFullName(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getPayrollPeriod(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getPayDate(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">{getBasicSalary(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">{getTotalEarnings(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">{getTotalDeductions(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getGrossSalary(payroll)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">{getNetSalary(payroll)}</TableCell>
              <TableCell className="text-center">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-md capitalize ${getStatusClass(payroll.status)}`}
                >
                  {payroll.status}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PayrollActions payroll={payroll} onView={handleViewPayroll} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={10} className="text-center text-muted-foreground dark:text-gray-300">
              No payrolls found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};