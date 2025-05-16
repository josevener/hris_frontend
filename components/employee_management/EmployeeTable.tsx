import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Employee, SortKey, UserRole } from "@/types/employee";
import EmployeeActions from "./EmployeeActions";
import { useMemo } from "react";
import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewProfile: (employee: Employee) => void; // Renamed from handleView
  userRole: UserRole;
  itemsPerPage: number;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  sortConfig,
  handleSort,
  handleViewProfile,
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

  // const getSupervisorName = (reportsTo: string | null) =>
  //   !reportsTo || reportsTo === "none"
  //     ? "None"
  //     : employees.find((e) => e.user_id === parseInt(reportsTo))?.user
  //     ? `${employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.firstname} ${
  //         employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.middlename
  //           ? employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.middlename[0] + "."
  //           : ""
  //       } ${employees.find((e) => e.user_id === parseInt(reportsTo))!.user!.lastname}`.trim()
  //     : "N/A";

  const getRoleVariant = (role: UserRole | undefined) => {
    switch (role) {
      case "Admin":
        return "default";
      case "HR":
        return "secondary";
      case "Employee":
        return "outline";
      default:
        return "destructive"; // For undefined or unexpected roles
    }
  };
  
  type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]
  
  function getEmploymentStatusVariant(status?: string): BadgeVariant {
    switch (status) {
      case "active":
        return "outline-success"
      case "resigned":
      case "terminated":
      case "deceased":
        return "outline-destructive"
      case "on_leave":
      case "suspended":
        return "outline-warning"
      case "pending_onboarding":
        return "outline-info"
      case "retired":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const renderKey = useMemo(() => Date.now(), []);

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive employee management directory.
      </TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("user.lastname")}
          >
            Name <SortIcon column="user.lastname" />
          </TableHead>
          <TableHead className="text-foreground dark:text-foreground">Employee No.</TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("designation.designation")}
          >
            Job Title <SortIcon column="designation.designation" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("department.department")}
          >
            Department <SortIcon column="department.department" />
          </TableHead>
          {/* <TableHead className="text-foreground dark:text-foreground">Supervisor</TableHead> */}
          <TableHead className="text-foreground dark:text-foreground">Birth Date</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Status</TableHead>
          <TableHead className="text-foreground dark:text-foreground">Role</TableHead>
          <TableHead className="w-[100px] text-center text-foreground dark:text-foreground">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }, (_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              {/* <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell> */}
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : employees.length > 0 ? (
          employees.map((employee, index) => (
            <TableRow
              key={employee.id ?? `temp-${index}-${Date.now()}`}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{getFullName(employee)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{employee.company_id_number || "N/A"}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{employee.designation?.designation || "N/A"}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{employee.department?.department || "N/A"}</TableCell>
              {/* <TableCell className="text-foreground dark:text-foreground">{getSupervisorName(employee.reports_to)}</TableCell> */}
              <TableCell className="text-foreground dark:text-foreground">
                {employee.birthdate ? new Date(employee.birthdate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }) : "N/A"}
              </TableCell>
              <TableCell className="text-foreground dark:text-foreground">
                <Badge variant={getEmploymentStatusVariant(employee.user?.employment_status)}>
                  {employee.user?.employment_status
                    ? employee.user.employment_status
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                    : "N/A"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getRoleVariant(employee.user?.role_name as UserRole)}
                  className={
                    employee.user?.role_name === "Admin"
                      ? "dark:bg-blue-600"
                      : employee.user?.role_name === "HR"
                      ? "dark:bg-purple-600"
                      : employee.user?.role_name === "Employee"
                      ? "dark:bg-gray-600"
                      : "dark:bg-red-600"
                  }
                >
                  {employee.user?.role_name || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <EmployeeActions
                    employee={employee}
                    onView={handleViewProfile}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={8} className="text-center text-muted-foreground dark:text-gray-300">
              No employees found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};