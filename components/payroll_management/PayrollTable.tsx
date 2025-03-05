import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import PayrollActions from "./PayrollActions";
import { Payroll } from "@/types/payroll";

interface PayrollTableProps {
  payrolls: Payroll[];
  loading: boolean;
  handleEdit: (payroll: Payroll) => void;
  handleDelete: (payroll: Payroll) => void;
  handleViewProfile: (payroll: Payroll) => void;
  userRole: UserRole;
}

const PayrollTable: React.FC<PayrollTableProps> = ({
  payrolls,
  loading,
  handleEdit,
  handleDelete,
  handleViewProfile,
  userRole,
}) => {
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
    return value !== undefined ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "N/A";
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Employee</TableHead>
          <TableHead className="dark:text-gray-200">Total Earnings</TableHead>
          <TableHead className="dark:text-gray-200">Total Deductions</TableHead>
          <TableHead className="dark:text-gray-200">Net Salary</TableHead>
          <TableHead className="dark:text-gray-200">Pay Date</TableHead>
          <TableHead className="dark:text-gray-200">Status</TableHead>
          <TableHead className="w-[150px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
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
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.total_earnings)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.total_deductions)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(payroll.net_salary)}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(payroll.pay_date).toLocaleDateString()}</TableCell>
              <TableCell className="dark:text-gray-200">{payroll.status}</TableCell>
              <TableCell className="text-center">
                <PayrollActions
                  payroll={payroll}
                  userRole={userRole}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewProfile={handleViewProfile}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={8} className="text-center dark:text-gray-300">
              No payrolls available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PayrollTable;