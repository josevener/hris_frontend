import { Salary } from "@/types/salary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, Edit, Trash, FileText } from "lucide-react";
import { UserRole } from "@/types/employee";

interface SalaryActionsProps {
  salary: Salary;
  userRole: UserRole;
  onEdit: (salary: Salary) => void;
  onDelete: (salary: Salary) => void;
  onViewProfile: (salary: Salary) => void;
}

const SalaryActions: React.FC<SalaryActionsProps> = ({
  salary,
  userRole,
  onEdit,
  onDelete,
  onViewProfile
}) => {
  console.log("SalaryActions rendered for salary ID:", salary.id, "userRole:", userRole); // Debug log

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-600">
        <MoreVertical className="h-5 w-5 dark:text-gray-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
       <DropdownMenuItem onClick={() => onViewProfile(salary)} className="dark:hover:bg-gray-700">
        <FileText className="w-4 h-4 mr-2" /> View Profile
      </DropdownMenuItem>
        {(userRole === "HR" || userRole === "Admin") && (
          <DropdownMenuItem onClick={() => onEdit(salary)} className="dark:hover:bg-gray-700">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
        )}
        {userRole === "Admin" && (
          <DropdownMenuItem onClick={() => onDelete(salary)} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900">
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SalaryActions;