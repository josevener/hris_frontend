import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { Holiday, UserRole } from "@/types/department";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface HolidayActionsProps {
  holiday: Holiday;
  onView: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => Promise<void>;
  userRole: UserRole;
}

const HolidayActions: React.FC<HolidayActionsProps> = ({
  holiday,
  onView,
  onDelete,
  userRole,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(holiday);
      toast.success("Holiday deleted successfully");
    } catch (err) {
      toast.error("Failed to delete holiday");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full p-2 focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:text-foreground dark:hover:bg-gray-700"
                aria-label={`Actions for holiday ${holiday.name_holiday}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <AnimatePresence>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800 dark:border-gray-700"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <DropdownMenuItem
                  onClick={() => onView(holiday)}
                  className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-gray-100 focus:bg-gray-100 dark:text-foreground dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>
                {(userRole === "HR" || userRole === "Admin") && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-md p-2 text-red-600 hover:bg-gray-100 focus:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                )}
              </motion.div>
            </DropdownMenuContent>
          </AnimatePresence>
        </DropdownMenu>
        <TooltipContent className="bg-gray-900 text-white dark:bg-gray-700">
          Holiday actions
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HolidayActions;