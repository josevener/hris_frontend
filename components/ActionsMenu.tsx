import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Edit, Trash, FileText } from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

interface ActionsMenuProps<T> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onView: (item: T) => void;
  userRole: string;
  canEdit: boolean;
  canDelete: boolean;
}

const ActionsMenu = <T,>({ item, onEdit, onDelete, onView, userRole, canEdit, canDelete }: ActionsMenuProps<T>) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-600">
      <MoreVertical className="h-5 w-5 dark:text-gray-200" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
      <DropdownMenuItem onClick={() => onView(item)} className="dark:hover:bg-gray-700">
        <FileText className="w-4 h-4 mr-2" /> View Profile
      </DropdownMenuItem>
      {canEdit && (
        <DropdownMenuItem onClick={() => onEdit(item)} className="dark:hover:bg-gray-700">
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
      )}
      {canDelete && (
        <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900">
          <Trash className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default ActionsMenu;