import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Department, Designation, Employee, UserRole } from "@/types/employee";

interface EmploymentTabProps {
  employee: Partial<Employee>;
  departments: Department[];
  designations: Designation[];
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const EmploymentTab: React.FC<EmploymentTabProps> = ({
  employee,
  departments,
  designations,
  onChange,
  userRole,
  isEditMode,
  isEditable,
}) => {
  return (
    <div className="grid gap-4 py-4 grid-cols-6">
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="department_id" className="text-foreground dark:text-foreground">Department *</Label>
        <Select
          value={employee.department_id?.toString() || ""}
          onValueChange={(value) => onChange({ ...employee, department_id: parseInt(value) || 0, designation_id: 0 })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
        >
          <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="designation_id" className="text-foreground dark:text-foreground">Designation *</Label>
        <Select
          value={employee.designation_id?.toString() || ""}
          onValueChange={(value) => onChange({ ...employee, designation_id: parseInt(value) || 0 })}
          disabled={(!employee.department_id || (!isEditable && isEditMode)) || userRole === "Employee"}
        >
          <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectValue placeholder="Select Designation" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            {designations
              .filter((desig) => desig.department_id === employee.department_id)
              .map((desig) => (
                <SelectItem key={desig.id} value={desig.id.toString()}>
                  {desig.designation}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="joining_date" className="text-foreground dark:text-foreground">Joining Date</Label>
        <Input
          id="joining_date"
          type="date"
          value={employee.joining_date || ""}
          onChange={(e) => onChange({ ...employee, joining_date: e.target.value || null })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="contract_type" className="text-foreground dark:text-foreground">Contract Type</Label>
        <Select
          value={employee.contract_type || "none"}
          onValueChange={(value) => onChange({ ...employee, contract_type: value === "none" ? null : value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
        >
          <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectValue placeholder="Select Contract Type" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="Permanent">Permanent</SelectItem>
            <SelectItem value="Contractual">Contractual</SelectItem>
            <SelectItem value="Probationary">Probationary</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmploymentTab;