import { Designation, UserRole } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

interface DesignationActionsProps {
  designation: Designation;
  onView: (designation: Designation) => void;
  userRole: UserRole;
}

const DesignationActions: React.FC<DesignationActionsProps> = ({ designation, onView, userRole }) => (
  <div className="flex gap-2">
    <Button
      onClick={() => onView(designation)}
      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground flex items-center gap-2"
    >
      <Eye className="h-4 w-4" /> View
    </Button>
    {(userRole === "HR" || userRole === "Admin") && (
      <Button
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("openDeleteModal", { detail: designation })
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

export default DesignationActions;