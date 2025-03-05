import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash, FileText } from "lucide-react";
import { UserRole } from "@/types/employee";
import { PayrollItem } from "@/types/payroll";

interface PayrollItemActionsProps {
  payrollItem: PayrollItem;
  userRole: UserRole;
  onEdit: (payrollItem: PayrollItem) => void;
  onDelete: (payrollItem: PayrollItem) => void;
  onViewProfile: (payrollItem: PayrollItem) => void;
}

const PayrollItemActions: React.FC<PayrollItemActionsProps> = ({
  payrollItem,
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
      <DropdownMenuItem onClick={() => onViewProfile(payrollItem)} className="dark:hover:bg-gray-700">
        <FileText className="w-4 h-4 mr-2" /> View Profile
      </DropdownMenuItem>
      {(userRole === "HR" || userRole === "Admin") && (
        <DropdownMenuItem onClick={() => onEdit(payrollItem)} className="dark:hover:bg-gray-700">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
      )}
      {userRole === "Admin" && (
        <DropdownMenuItem onClick={() => onDelete(payrollItem)} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900">
          <Trash className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default PayrollItemActions;