import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payslip, PayslipSortKey } from "@/types/payslip";
import PayslipActions from "./PayslipActions";
import { format } from "date-fns";
import { useMemo } from "react";

interface PayslipTableProps {
  payslips: Payslip[];
  loading: boolean;
  sortConfig: { key: PayslipSortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: PayslipSortKey) => void;
  itemsPerPage: number;
}

export const PayslipTable: React.FC<PayslipTableProps> = ({
  payslips,
  loading,
  sortConfig,
  handleSort,
  itemsPerPage,
}) => {
  const SortIcon = ({ column }: { column: PayslipSortKey }) =>
    sortConfig?.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 inline" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4 inline" />
      )
    ) : null;

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return numValue.toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getFullName = (payslip: Payslip) =>
    payslip.employee?.user
      ? `${payslip.employee.user.firstname} ${payslip.employee.user.middlename ? payslip.employee.user.middlename[0] + "." : ""} ${payslip.employee.user.lastname}`.trim()
      : `Employee #${payslip.employee_id}`;

  const getPayrollPeriod = (payslip: Payslip) =>
    payslip.payroll_cycle
      ? `${format(new Date(payslip.payroll_cycle.start_date), "MMMM dd")} - ${format(new Date(payslip.payroll_cycle.end_date), "MMMM dd, yyyy")}`
      : "N/A";

  const renderKey = useMemo(() => Date.now(), []);

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive payslip management directory.
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
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("issued_date")}
          >
            Issued Date <SortIcon column="issued_date" />
          </TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Basic Salary</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Total Earnings</TableHead>
          <TableHead className="text-foreground dark:text-foreground text-center">Total Deductions</TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground text-center"
            onClick={() => handleSort("gross_salary")}
          >
            Gross Salary <SortIcon column="gross_salary" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground text-center"
            onClick={() => handleSort("net_salary")}
          >
            Net Salary <SortIcon column="net_salary" />
          </TableHead>
          <TableHead className="w-[100px] text-center text-foreground dark:text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }, (_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-18 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-18 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-18 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : payslips.length > 0 ? (
          payslips.map((payslip) => (
            <TableRow
              key={payslip.id}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{getFullName(payslip)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{getPayrollPeriod(payslip)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">
                {payslip.issued_date ? format(new Date(payslip.issued_date), "MMMM dd, yyyy") : "N/A"}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">
                {payslip.salary ? formatCurrency(payslip.salary.basic_salary) : "N/A"}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">
                {formatCurrency(payslip.earnings)}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">
                {formatCurrency(payslip.deductions)}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">
                {formatCurrency(payslip.gross_salary)}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground text-center">
                {formatCurrency(payslip.net_salary)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <PayslipActions payslip={payslip} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={9} className="text-center text-muted-foreground dark:text-gray-300">
              No payslips found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};