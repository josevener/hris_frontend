import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Salary } from "@/types/salary";
import { UserRole } from "@/types/employee";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";

interface SalaryTableProps {
  salaries: Salary[];
  loading: boolean;
  handleEdit: (salary: Salary) => void;
  handleDelete: (salary: Salary) => void;
  handleViewSalary: (salary: Salary) => void;
  userRole: UserRole;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ salaries, loading, handleViewSalary }) => {
  const getFullName = (salary: Salary): string => {
    const employee = salary.employee;
    if (!employee || !employee.user) {
      console.warn(`Missing employee or user data for salary ID ${salary.id}. Employee ID: ${salary.employee_id}`, salary);
      return `Employee #${salary.employee_id}`;
    }
    const { user } = employee;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const formatSalary = (basic_salary: number | undefined): string => {
    return (basic_salary ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Employee</TableHead>
          <TableHead className="dark:text-gray-200">Amount</TableHead>
          <TableHead className="dark:text-gray-200">Pay Period</TableHead>
          <TableHead className="dark:text-gray-200">Start Date</TableHead>
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
              <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : salaries.length > 0 ? (
          salaries.map((salary, index) => (
            <TableRow key={salary.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(salary)}</TableCell>
              <TableCell className="dark:text-gray-200">{formatSalary(salary.basic_salary)}</TableCell>
              <TableCell className="dark:text-gray-200">{salary.pay_period}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(salary.start_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-center">
                <Button onClick={() => handleViewSalary(salary)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={6} className="text-center dark:text-gray-300">
              No salaries available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default SalaryTable;