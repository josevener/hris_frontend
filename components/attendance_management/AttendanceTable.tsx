import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Attendance } from "@/types/attendance";
import { UserRole } from "@/types/employee";
import AttendanceActions from "./AttendanceActions";

interface AttendanceTableProps {
  attendances: Attendance[];
  loading: boolean;
  handleEdit: (attendance: Attendance) => void;
  handleViewProfile: (attendance: Attendance) => void;
  userRole: UserRole;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendances,
  loading,
  handleEdit,
  handleViewProfile,
  userRole,
}) => {
  const getFullName = (attendance: Attendance): string => {
    const employee = attendance.employee;
    if (!employee || !employee.user) {
      return "Unknown Employee"; // Fallback if employee data is missing
    }
    const { user } = employee;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${
      user.extension || ""
    }`.trim();
  };

  const formatWorkedHours = (workedHours: number | string | null | undefined): string => {
    if (typeof workedHours === "number") {
      return workedHours.toFixed(2); // Handle numeric values
    }
    if (typeof workedHours === "string") {
      const parsed = Number(workedHours); // Parse string to number
      return isNaN(parsed) ? "N/A" : parsed.toFixed(2); // Handle invalid strings
    }
    return "N/A"; // Return "N/A" for undefined, null, or other types
  };

  const getStatusRemarks = (attendance: Attendance): string => {
    const STANDARD_HOURS = 8; // Standard work hours per day
    const EXPECTED_CLOCK_IN = "08:00:00"; // Expected clock-in time (9:00 AM)

    const remarks: string[] = [];

    // Check if Late (clock_in after 9:00 AM)
    if (attendance.clock_in && attendance.clock_in > EXPECTED_CLOCK_IN) {
      remarks.push("Late");
    }

    // Check for Undertime or Overtime based on worked_hours
    const workedHours = typeof attendance.worked_hours === "number" ? attendance.worked_hours : parseFloat(String(attendance.worked_hours || 0));
    if (!isNaN(workedHours)) {
      if (workedHours < STANDARD_HOURS) {
        remarks.push("Undertime");
      } else if (workedHours > STANDARD_HOURS) {
        remarks.push("OT");
      }
    }

    // If no remarks, return "On Time"
    return remarks.length > 0 ? remarks.join(", ") : "On Time";
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] dark:text-gray-200">ID</TableHead>
          <TableHead className="dark:text-gray-200">Employee</TableHead>
          <TableHead className="dark:text-gray-200">Date</TableHead>
          <TableHead className="dark:text-gray-200">Clock In</TableHead>
          <TableHead className="dark:text-gray-200">Clock Out</TableHead>
          <TableHead className="dark:text-gray-200">Rendered Hours</TableHead>
          <TableHead className="dark:text-gray-200">Status/Remarks</TableHead>
          <TableHead className="w-[150px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : attendances.length > 0 ? (
          attendances.map((attendance, index) => (
            <TableRow key={attendance.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(attendance)}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(attendance.date).toLocaleDateString()}</TableCell>
              <TableCell className="dark:text-gray-200">{attendance.clock_in || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{attendance.clock_out || "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">
                {formatWorkedHours(attendance.worked_hours)}
              </TableCell>
              <TableCell className="dark:text-gray-200">
                {getStatusRemarks(attendance)}
              </TableCell>
              <TableCell className="text-center">
                <AttendanceActions
                  attendance={attendance}
                  userRole={userRole}
                  onEdit={handleEdit}
                  onViewProfile={handleViewProfile}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={8} className="text-center dark:text-gray-300">
              No attendance records available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AttendanceTable;