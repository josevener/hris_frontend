import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Holiday, UserRole } from "@/types/department";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HolidayActionsProps {
  holiday: Holiday;
  onView: (holiday: Holiday) => void;
  userRole: UserRole;
}

const HolidayActions: React.FC<HolidayActionsProps> = ({
  holiday,
  onView,
  userRole,
}) => {
  const handleDelete = () => {
    const event = new CustomEvent("openDeleteModal", { detail: holiday });
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
            onClick={() => onView(holiday)}
            className="justify-start text-foreground dark:text-foreground dark:hover:bg-gray-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
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

export default HolidayActions;