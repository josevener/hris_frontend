import { User } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
}

const UserActions: React.FC<UserActionsProps> = ({ user, onView }) => (
  <div className="flex gap-2">
    <Button
      onClick={() => onView(user)}
      className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
    >
      <Eye className="h-4 w-4" /> View
    </Button>
  </div>
);

export default UserActions;