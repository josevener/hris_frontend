import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import PayrollItemActions from "./PayrollItemActions";
import { PayrollItem } from "@/types/payroll";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface PayrollItemTableProps {
  payrollItems: PayrollItem[];
  loading: boolean;
  handleEdit: (payrollItem: PayrollItem) => void;
  handleDelete: (payrollItem: PayrollItem) => void;
  handleViewProfile: (payrollItem: PayrollItem) => void;
  userRole: UserRole;
}

const PayrollItemTable: React.FC<PayrollItemTableProps> = ({
  payrollItems,
  loading,
  handleEdit,
  handleDelete,
  handleViewProfile,
  userRole,
}) => {
  const getFullName = (payrollItem: PayrollItem): string => {
    const employee = payrollItem.employee;
    if (!employee || !employee.user) {
      console.warn(`Missing employee or user data for payroll item ID ${payrollItem.id}. Employee ID: ${payrollItem.employee_id}`, payrollItem);
      return `Employee #${payrollItem.employee_id}`;
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
          <TableHead className="dark:text-gray-200">Payroll Date</TableHead>
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
              <TableCell className="dark:text-gray-200">{item.payroll ? format(new Date(item.payroll.pay_date), "MMMM dd, yyyy") : "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(item)}</TableCell>
              <TableCell className="dark:text-gray-200">{item.type}</TableCell>
              <TableCell className="dark:text-gray-200">{item.category}</TableCell>
              <TableCell className="dark:text-gray-200">{formatCurrency(item.amount)}</TableCell>
              <TableCell className="text-center">
                {/* <div>
                  <Button onClick={() => handleEdit(item)}>View</Button>
                </div> */}
                <PayrollItemActions
                  payrollItem={item}
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