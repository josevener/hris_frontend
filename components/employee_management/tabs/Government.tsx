import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, UserRole } from "@/types/employee";

interface GovernmentTabProps {
  employee: Partial<Employee>;
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const GovernmentTab: React.FC<GovernmentTabProps> = ({
  employee,
  onChange,
  userRole,
  isEditMode,
  isEditable,
}) => {
  return (
    <div className="grid gap-4 py-4 grid-cols-6">
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="sss_id" className="text-foreground dark:text-foreground">SSS ID</Label>
        <Input
          id="sss_id"
          value={employee.sss_id || ""}
          onChange={(e) => onChange({ ...employee, sss_id: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="philhealth_id" className="text-foreground dark:text-foreground">PhilHealth ID</Label>
        <Input
          id="philhealth_id"
          value={employee.philhealth_id || ""}
          onChange={(e) => onChange({ ...employee, philhealth_id: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="pagibig_id" className="text-foreground dark:text-foreground">Pag-IBIG ID</Label>
        <Input
          id="pagibig_id"
          value={employee.pagibig_id || ""}
          onChange={(e) => onChange({ ...employee, pagibig_id: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="tin" className="text-foreground dark:text-foreground">TIN</Label>
        <Input
          id="tin"
          value={employee.tin || ""}
          onChange={(e) => onChange({ ...employee, tin: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="tax" className="text-foreground dark:text-foreground">Tax Status</Label>
        <Input
          id="tax"
          value={employee.tax || ""}
          onChange={(e) => onChange({ ...employee, tax: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
    </div>
  );
};

export default GovernmentTab;