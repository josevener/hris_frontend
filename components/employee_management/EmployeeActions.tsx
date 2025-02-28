import { Employee, UserRole } from "@/types/employee";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreVertical, Edit, Trash, FileText } from "lucide-react";

interface EmployeeActionsProps {
  employee: Employee;
  userRole: UserRole;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onViewProfile: (employee: Employee) => void;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({
  employee,
  userRole,
  onEdit,
  onDelete,
  onViewProfile,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-600">
      <MoreVertical className="h-5 w-5 dark:text-gray-200" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
      <DropdownMenuItem onClick={() => onViewProfile(employee)} className="dark:hover:bg-gray-700">
        <FileText className="w-4 h-4 mr-2" /> View Profile
      </DropdownMenuItem>
      {(userRole === "HR" || userRole === "Admin" || userRole === "Employee") && (
        <DropdownMenuItem onClick={() => onEdit(employee)} className="dark:hover:bg-gray-700">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
      )}
      {(userRole === "HR" || userRole === "Admin") && (
        <DropdownMenuItem onClick={() => onDelete(employee)} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900">
          <Trash className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default EmployeeActions;