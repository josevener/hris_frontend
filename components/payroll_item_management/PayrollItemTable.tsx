import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import PayrollItemActions from "./PayrollItemActions";
import { PayrollItem, PayrollCycle } from "@/types/payroll";
import { format } from "date-fns";

interface PayrollItemTableProps {
  payrollItems: PayrollItem[];
  loading: boolean;
  handleEdit: (payrollItem: PayrollItem) => void;
  handleDelete: (payrollItem: PayrollItem) => void;
  handleView: (payrollItem: PayrollItem) => void;
  userRole: UserRole;
  payrollCycles: PayrollCycle[]; // Add payrollCycles prop
}

const PayrollItemTable: React.FC<PayrollItemTableProps> = ({
  payrollItems,
  loading,
  handleView,
  payrollCycles,
}) => {
  const getFullName = (payrollItem: PayrollItem): string => {
    const employee = payrollItem.employee;
    if (!employee || !employee.user) {
      return payrollItem.scope === "global" ? "All Employees" : `Employee #${payrollItem.employee_id || "Unknown"}`;
    }
    const { user } = employee;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const formatCurrency = (value: number | undefined): string => {
    return value !== undefined
      ? value.toLocaleString("en-US", { style: "currency", currency: "PHP", maximumFractionDigits: 2 })
      : "N/A";
  };

  const formatPeriod = (item: PayrollItem): string => {
    if (item.payroll_cycles_id) {
      const cycle = payrollCycles.find((c) => c.id === item.payroll_cycles_id);
      if (cycle && cycle.start_date && cycle.end_date) {
        return `${format(new Date(cycle.start_date), "MMM dd, yyyy")} - ${format(new Date(cycle.end_date), "MMM dd, yyyy")}`;
      }
    }
    if (item.start_date && item.end_date) {
      return `${format(new Date(item.start_date), "MMM dd, yyyy")} - ${format(new Date(item.end_date), "MMM dd, yyyy")}`;
    }
    return "Not Assigned";
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Payroll Period</TableHead>
          <TableHead className="dark:text-gray-200">Employee</TableHead>
          <TableHead className="dark:text-gray-200">Type</TableHead>
          <TableHead className="dark:text-gray-200">Category</TableHead>
          <TableHead className="dark:text-gray-200">Amount</TableHead>
          <TableHead className="w-[150px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : payrollItems.length > 0 ? (
          payrollItems.map((item, index) => (
            <TableRow key={item.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{formatPeriod(item)}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(item)}</TableCell>
              <TableCell className="dark:text-gray-200">{item.type}</TableCell>
              <TableCell className="dark:text-gray-200">{item.category}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(Number(item.amount))}</TableCell>
              <TableCell className="text-center">
                <PayrollItemActions
                  payrollItem={item} // Pass single item, not array
                  onView={handleView}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={7} className="text-center dark:text-gray-300">
              No payroll items available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PayrollItemTable;