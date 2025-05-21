import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import { Designation, UserRole } from "@/types/department";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DesignationActionsProps {
  designation: Designation;
  onView: (designation: Designation) => void;
  userRole: UserRole;
}

const DesignationActions: React.FC<DesignationActionsProps> = ({
  designation,
  onView,
  userRole,
}) => {
  const handleDelete = () => {
    const event = new CustomEvent("openDeleteModal", { detail: designation });
    window.dispatchEvent(event);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="dark:text-foreground dark:hover:bg-gray-700"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(designation)}
            className="justify-start text-foreground dark:text-foreground dark:hover:bg-gray-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          {(userRole === "HR" || userRole === "Admin") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="justify-start text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DesignationActions;