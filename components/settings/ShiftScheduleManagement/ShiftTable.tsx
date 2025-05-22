import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/employee";
import ShiftActions from "./ShiftActions";
import { Shift } from "@/types/shift";
import { format } from "date-fns";
import { Employee } from "@/types/employee";
import CustomActions, { ActionItem } from "@/components/custom_components/CustomActions";
import { Eye, Trash2 } from "lucide-react";

interface ShiftTableProps {
  shifts: Shift[];
  loading: boolean;
  handleDelete: (shift: Shift) => void;
  handleView: (shift: Shift) => void;
  userRole: UserRole;
  allEmployees: Employee[];
}

const ShiftTable: React.FC<ShiftTableProps> = ({
  shifts,
  loading,
  // handleDelete,
  handleView,
  userRole,
  allEmployees,
}) => {
  const getFullName = (employeeId: number): string => {
    const employee = allEmployees.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.user?.firstname} ${employee.user?.middlename ? employee.user.middlename[0] + "." : ""} ${employee.user?.lastname} ${employee.user?.extension || ""}`.trim()
      : `Employee #${employeeId}`;
  };

  const formatDate = (date: string): string => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const formatScheduleSettings = (settings: Shift["schedule_settings"]): string => {
    if (!settings || settings.length === 0) return "N/A";

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const workingDays = settings
      .map((setting, index) => ({ ...setting, index }))
      .filter((setting) => !setting.is_rest_day);

    if (workingDays.length === 0) return "All Rest Days";
    if (workingDays.length === 7) return "All Days";

    const ranges: string[] = [];
    let start: number | null = null;
    let prev: number | null = null;

    workingDays.forEach((day, i) => {
      if (start === null) {
        start = day.index;
      } else if (prev !== null && day.index !== prev + 1) {
        if (start === prev) {
          ranges.push(daysOfWeek[start].slice(0, 3));
        } else {
          ranges.push(`${daysOfWeek[start].slice(0, 3)}-${daysOfWeek[prev].slice(0, 3)}`);
        }
        start = day.index;
      }
      prev = day.index;

      if (i === workingDays.length - 1) {
        if (start === day.index) {
          ranges.push(daysOfWeek[start].slice(0, 3));
        } else {
          ranges.push(`${daysOfWeek[start].slice(0, 3)}-${daysOfWeek[day.index].slice(0, 3)}`);
        }
      }
    });

    const hours = workingDays[0].hours; // Assuming all working days have the same hours
    const hoursText = workingDays.every(day => day.hours === hours) ? ` (${hours})` : "";
    return ranges.join(", ") + hoursText;
  };

  const formatEmployees = (employeeIds: number[]): string => {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return "No employees assigned";
    }
    const names = employeeIds.map(getFullName);
    if (employeeIds.length === 1) {
      return names[0];
    }
    if (employeeIds.length <= 2) {
      return names.join(", ");
    }
    return `${names.slice(0, 2).join(", ")}, and ${employeeIds.length - 2} others`;
  };
  const actions: ActionItem<Shift>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleView(item),
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
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Employees</TableHead>
          <TableHead className="w-[200px] dark:text-gray-200">Schedule Period</TableHead>
          <TableHead className="dark:text-gray-200">Description</TableHead>
          <TableHead className="w-[150px] dark:text-gray-200">Schedule Settings</TableHead>
          <TableHead className="w-[50px] text-center dark:text-gray-200">Actions</TableHead>
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
              <TableCell className="dark:text-gray-200">
                {formatEmployees(shift.employee_ids)}
              </TableCell>
              <TableCell className="dark:text-gray-200">
                {shift.start_date && shift.end_date
                  ? `${formatDate(shift.start_date)} - ${formatDate(shift.end_date)}`
                  : "N/A"}
              </TableCell>
              <TableCell className="dark:text-gray-200">{shift.description || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{formatScheduleSettings(shift.schedule_settings)}</TableCell>
              <TableCell className="text-center">
                {(userRole === "HR" || userRole === "Admin") && (
                  <CustomActions actions={actions} item={shift} />
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