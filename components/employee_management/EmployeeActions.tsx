import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface EmployeeActionsProps {
  employee: Employee;
  onView: (employee: Employee) => void;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({ employee, onView }) => (
  <Button
    onClick={() => onView(employee)}
    className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
  >
    <Eye className="h-4 w-4" /> View
  </Button>
);

export default EmployeeActions;