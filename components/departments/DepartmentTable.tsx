import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown, Eye, Trash2 } from "lucide-react";
import { Department, UserRole, SortKey } from "@/types/employee";
import { useMemo } from "react";
import CustomActions, { ActionItem } from "../custom_components/CustomActions";

interface DepartmentTableProps {
  departments: Department[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewProfile: (department: Department) => void;
  userRole: UserRole;
  itemsPerPage: number;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
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

  const renderKey = useMemo(() => Date.now(), []);

  const actions: ActionItem<Department>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleViewProfile(item),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) =>
        window.dispatchEvent(new CustomEvent("openDeleteModal", { detail: item })),

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      show: (item) => userRole === "HR" || userRole === "Admin",
      danger: true,
    },
  ];
  
  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive department management directory.
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
            onClick={() => handleSort("department")}
          >
            Department <SortIcon column="department" />
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
              <TableCell className="text-center">
                <Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" />
              </TableCell>
            </TableRow>
          ))
        ) : departments.length > 0 ? (
          departments.map((department, index) => (
            <TableRow
              key={department.id}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{index + 1}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{department.department}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <CustomActions actions={actions} item={department} />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow key="no-departments" className="dark:bg-gray-800">
            <TableCell colSpan={3} className="text-center text-muted-foreground dark:text-gray-300">
              No departments found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};