import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Designation, Department, UserRole, SortKey } from "@/types/employee";
import DesignationActions from "./DesignationActions";
import { useMemo } from "react";

interface DesignationTableProps {
  designations: Designation[];
  departments: Department[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewProfile: (designation: Designation) => void;
  userRole: UserRole;
  itemsPerPage: number;
}

export const DesignationTable: React.FC<DesignationTableProps> = ({
  designations,
  departments,
  loading,
  sortConfig,
  handleSort,
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

  const getDepartmentName = (departmentId: number) =>
    departments.find((dept) => dept.id === departmentId)?.department || "N/A";

  const renderKey = useMemo(() => Date.now(), []);

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive designation management directory.
      </TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead
            className="w-[50px] cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("id")}
          >
            ID <SortIcon column="id" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("designation")}
          >
            Designation <SortIcon column="designation" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("department.department")}
          >
            Department <SortIcon column="department.department" />
          </TableHead>
          <TableHead className="w-[150px] text-center text-foreground dark:text-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" />
              </TableCell>
            </TableRow>
          ))
        ) : designations.length > 0 ? (
          designations.map((designation, index) => (
            <TableRow
              key={designation.id}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{index + 1}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{designation.designation}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">
                {getDepartmentName(designation.department_id)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <DesignationActions
                    designation={designation}
                    onView={handleViewProfile}
                    userRole={userRole}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={4} className="text-center text-muted-foreground dark:text-gray-300">
              No designations found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};