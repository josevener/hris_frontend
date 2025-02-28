import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Employee, SortKey, UserRole } from "@/types/employee";
import EmployeeActions from "./EmployeeActions";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleEdit: (employee: Employee) => void;
  handleDelete: (employee: Employee) => void;
  handleViewProfile: (employee: Employee) => void;
  userRole: UserRole;
  itemsPerPage: number;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  sortConfig,
  handleSort,
  handleEdit,
  handleDelete,
  handleViewProfile,
  userRole,
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

  const getFullName = (employee: Employee) =>
    employee.user
      ? `${employee.user.firstname} ${employee.user.middlename ? employee.user.middlename[0] + "." : ""} ${employee.user.lastname}`.trim()
      : "N/A";

  const getSupervisorName = (reportsTo: string | null) =>
    !reportsTo || reportsTo === "none"
      ? "None"
      : employees.find((e) => e.user_id === parseInt(reportsTo))?.user
      ? `${employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.firstname} ${
          employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.middlename
            ? employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.middlename[0] + "."
            : ""
        } ${employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.lastname}`.trim()
      : "N/A";

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="dark:text-gray-300">Comprehensive employee management directory.</TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] cursor-pointer dark:text-gray-200" onClick={() => handleSort("id")}>
            No. <SortIcon column="id" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("user.lastname")}>
            Name <SortIcon column="user.lastname" />
          </TableHead>
          <TableHead className="dark:text-gray-200">Employee No.</TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("designation.designation")}>
            Designation <SortIcon column="designation.designation" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("department.department")}>
            Department <SortIcon column="department.department" />
          </TableHead>
          <TableHead className="dark:text-gray-200">Supervisor</TableHead>
          <TableHead className="dark:text-gray-200">Birth Date</TableHead>
          <TableHead className="dark:text-gray-200">Status</TableHead>
          <TableHead className="w-[50px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-6 w-6 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : employees.length > 0 ? (
          employees.map((employee, index) => (
            <TableRow key={employee.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(employee)}</TableCell>
              <TableCell className="dark:text-gray-200">{employee.company_id_number || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{employee.designation?.designation || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{employee.department?.department || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{getSupervisorName(employee.reports_to)}</TableCell>
              <TableCell className="dark:text-gray-200">
                {employee.birthdate ? new Date(employee.birthdate).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.isActive === 1 ? "default" : employee.isActive === 0 ? "secondary" : "destructive"}
                  className={employee.isActive === 1 ? "dark:bg-green-600" : "dark:bg-gray-600"}
                >
                  {employee.isActive === 1 ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <EmployeeActions
                  employee={employee}
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
            <TableCell colSpan={9} className="text-center dark:text-gray-300">
              No employees found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};