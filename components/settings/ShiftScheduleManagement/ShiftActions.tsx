import { Eye, Trash2 } from "lucide-react";
import { Shift } from "@/types/shift";
import { Button } from "@/components/ui/button";

interface ShiftActionsProps {
  shift: Shift;
  onView: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
}

const ShiftActions: React.FC<ShiftActionsProps> = ({
  shift,
  onView,
  onDelete,
}) => (
  <div className="flex gap-2 justify-center">
    <Button
      onClick={() => onView(shift)}
      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
    >
      <Eye className="h-4 w-4" /> View
    </Button>
    <Button
      variant="destructive"
      onClick={() => onDelete(shift)}
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  </div>
);

export default ShiftActions;