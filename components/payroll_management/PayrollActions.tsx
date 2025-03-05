import { Payroll } from "@/types/payroll";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, FileText } from "lucide-react";
import { UserRole } from "@/types/employee";

interface PayrollActionsProps {
  payroll: Payroll;
  userRole: UserRole;
  onEdit: (payroll: Payroll) => void;
  onDelete: (payroll: Payroll) => void;
  onViewProfile: (payroll: Payroll) => void;
}

const PayrollActions: React.FC<PayrollActionsProps> = ({
  payroll,
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
      <DropdownMenuItem onClick={() => onViewProfile(payroll)} className="dark:hover:bg-gray-700">
        <FileText className="w-4 h-4 mr-2" /> View Profile
      </DropdownMenuItem>
      {(userRole === "HR" || userRole === "Admin") && (
        <DropdownMenuItem onClick={() => onEdit(payroll)} className="dark:hover:bg-gray-700">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
      )}
      {userRole === "Admin" && (
        <DropdownMenuItem onClick={() => onDelete(payroll)} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900">
          <Trash className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default PayrollActions;