import { Department, UserRole } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

interface DepartmentActionsProps {
  department: Department;
  onView: (department: Department) => void;
  userRole: UserRole;
}

const DepartmentActions: React.FC<DepartmentActionsProps> = ({ department, onView, userRole }) => (
  <div className="flex gap-2">
    <Button
      onClick={() => onView(department)}
      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground flex items-center gap-2"
    >
      <Eye className="h-4 w-4" /> View
    </Button>
    {(userRole === "HR" || userRole === "Admin") && (
      <Button
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("openDeleteModal", { detail: department })
          );
        }}
        variant="destructive"
        className="dark:bg-red-700 dark:hover:bg-red-600 dark:text-foreground flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
    )}
  </div>
);

export default DepartmentActions;