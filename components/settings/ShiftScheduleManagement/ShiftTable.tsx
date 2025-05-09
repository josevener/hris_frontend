import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import ShiftActions from "./ShiftActions";
import { Shift } from "@/types/shift";
import { format } from "date-fns";

interface ShiftTableProps {
  shifts: Shift[];
  loading: boolean;
  // handleEdit: (shift: Shift) => void;
  handleDelete: (shift: Shift) => void;
  handleView: (shift: Shift) => void;
  userRole: UserRole;
}

const ShiftTable: React.FC<ShiftTableProps> = ({
  shifts,
  loading,
  // handleEdit,
  handleDelete,
  handleView,
  userRole,
}) => {
  const getFullName = (shift: Shift): string => {
    const employee = shift.employee;
    if (!employee || !employee.user) {
      return `Employee #${shift.employee_id || "Unknown"}`;
    }
    const { user } = employee;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const formatDate = (date: string): string => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const formatScheduleSettings = (settings: Shift["schedule_settings"]): string => {
    if (!settings || settings.length === 0) return "N/A";
    return settings
      .map((setting) =>
        setting.is_rest_day ? `${setting.day}: Rest Day` : `${setting.day}: ${setting.hours}`
      )
      .join(", ");
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Employee</TableHead>
          <TableHead className="dark:text-gray-200">Schedule Period</TableHead>
          <TableHead className="dark:text-gray-200">Description</TableHead>
          <TableHead className="dark:text-gray-200">Schedule Settings</TableHead>
          <TableHead className="w-[200px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-64 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-40 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : shifts.length > 0 ? (
          shifts.map((shift, index) => (
            <TableRow key={shift.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(shift)}</TableCell>
              <TableCell className="dark:text-gray-200">
                {shift.start_date && shift.end_date
                  ? `${formatDate(shift.start_date)} - ${formatDate(shift.end_date)}`
                  : "N/A"}
              </TableCell>
              <TableCell className="dark:text-gray-200">{shift.description || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{formatScheduleSettings(shift.schedule_settings)}</TableCell>
              <TableCell className="text-center">
                {(userRole === "HR" || userRole === "Admin") && (
                  <ShiftActions
                    shift={shift}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={6} className="text-center dark:text-gray-300">
              No schedules available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ShiftTable;