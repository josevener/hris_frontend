import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Employee, Salary } from "@/types/salary";

interface SalaryFormProps {
  salary: Partial<Salary>;
  employees: Employee[];
  onChange: (updatedSalary: Partial<Salary>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
}

const SalaryForm: React.FC<SalaryFormProps> = ({
  salary,
  employees,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
}) => {
  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    if (!user) return `Employee #${employee.id}`;
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  // Get the full name for the current salary's employee in edit mode
  const currentEmployeeName = () => {
    if (salary.employee) {
      return getFullName(salary.employee);
    }
    const employee = employees.find((emp) => emp.id === salary.employee_id);
    return employee ? getFullName(employee) : `Employee #${salary.employee_id || "Unknown"}`;
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditMode ? "Edit Salary" : "Add New Salary"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        {/* Employee Select - Full Width */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="employee" className="text-sm font-medium">
            Employee *
          </Label>
          <Select
            onValueChange={(value) => onChange({ ...salary, employee_id: Number(value) })}
            value={salary.employee_id ? salary.employee_id.toString() : ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              {isEditMode ? (
                <span>{currentEmployeeName()}</span> // Display full name in edit mode
              ) : (
                <SelectValue placeholder="Choose an employee" />
              )}
            </SelectTrigger>
            <SelectContent>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {getFullName(employee)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No employees available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Two-Column Grid for Remaining Fields */}
        <div className="grid grid-cols-2 gap-3">
          {/* Salary Amount */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="amount" className="text-sm font-medium">
              Basic Salary *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 50000"
              value={salary.basic_salary || ""}
              onChange={(e) => onChange({ ...salary, basic_salary: parseFloat(e.target.value) || 0 })}
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>

          {/* Pay Period */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="pay_period" className="text-sm font-medium">
              Pay Period *
            </Label>
            <Select
              onValueChange={(value) => onChange({ ...salary, pay_period: value as Salary["pay_period"] })}
              value={salary.pay_period || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="start_date" className="text-sm font-medium">
              Start Date *
            </Label>
            <Input
              id="start_date"
              type="date"
              value={salary.start_date || ""}
              onChange={(e) => onChange({ ...salary, start_date: e.target.value })}
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="end_date" className="text-sm font-medium">
              End Date
            </Label>
            <Input
              id="end_date"
              type="date"
              value={salary.end_date || ""}
              onChange={(e) => onChange({ ...salary, end_date: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2 text-sm"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default SalaryForm;