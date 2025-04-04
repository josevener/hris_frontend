import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, FileText } from "lucide-react";
import { Attendance } from "@/types/attendance";
import { UserRole } from "@/types/employee";

interface AttendanceActionsProps {
  attendance: Attendance;
  userRole: UserRole;
  onEdit: (attendance: Attendance) => void;
  onViewProfile: (attendance: Attendance) => void;
}

const AttendanceActions: React.FC<AttendanceActionsProps> = ({
  attendance,
  userRole,
  onEdit,
  onViewProfile,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-600">
        <MoreVertical className="h-5 w-5 dark:text-gray-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
        <DropdownMenuItem onClick={() => onViewProfile(attendance)} className="dark:hover:bg-gray-700">
          <FileText className="w-4 h-4 mr-2" /> View Profile
        </DropdownMenuItem>
        {(userRole === "HR" || userRole === "Admin") && (
          <DropdownMenuItem onClick={() => onEdit(attendance)} className="dark:hover:bg-gray-700">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AttendanceActions;