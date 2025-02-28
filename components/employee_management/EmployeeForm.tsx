import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Department, Designation, Employee, User, UserRole } from "@/types/employee";

interface EmployeeFormProps {
  employee: Partial<Employee>;
  users: User[];
  departments: Department[];
  designations: Designation[];
  onChange: (updatedEmployee: Partial<Employee>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  userRole: UserRole;
  isEditMode?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  users,
  departments,
  designations,
  onChange,
  onSave,
  onCancel,
  isSaving,
  userRole,
  isEditMode = false,
}) => {
  const getFullName = (emp: Employee) =>
    emp.user
      ? `${emp.user.firstname} ${emp.user.middlename ? emp.user.middlename[0] + "." : ""} ${emp.user.lastname}`.trim()
      : "N/A";

  const getUserCompanyId = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.company_id_number : "";
  };

  return (
    <DialogContent className="sm:max-w-[900px] w-[90vw] bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="dark:text-white">{isEditMode ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <DialogDescription className="dark:text-gray-300">
          {isEditMode ? "Update the employee’s details." : "Enter the details for the new employee."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 grid-cols-6">
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="user_id" className="dark:text-gray-200">Employee Name *</Label>
          {isEditMode ? (
            <Input
              id="edit-user_id"
              value={getFullName(employee as Employee)}
              disabled
              className="bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
            />
          ) : (
            <Select
              value={employee.user_id?.toString() || ""}
              onValueChange={(value) => onChange({ ...employee, user_id: parseInt(value) || 0 })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="company_id_number" className="dark:text-gray-200">Employee ID</Label>
          <Input
            id="company_id_number"
            value={employee.user_id ? getUserCompanyId(employee.user_id) : ""}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="birthdate" className="dark:text-gray-200">Birthdate</Label>
          <Input
            id="birthdate"
            type="date"
            value={employee.birthdate || ""}
            onChange={(e) => onChange({ ...employee, birthdate: e.target.value || null })}
            disabled={userRole === "Employee"}
            className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="supervisor" className="dark:text-gray-200">Supervisor</Label>
          <Select
            value={employee.reports_to || "none"}
            onValueChange={(value) => onChange({ ...employee, reports_to: value === "none" ? null : value })}
            disabled={userRole === "Employee"}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Select Supervisor" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectItem value="none">None</SelectItem>
              {users
                .filter((user) => user.id !== employee.user_id)
                .map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="gender" className="dark:text-gray-200">Gender</Label>
          <Select
            value={employee.gender || "none"}
            onValueChange={(value) => onChange({ ...employee, gender: value === "none" ? null : value })}
            disabled={userRole === "Employee"}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="department_id" className="dark:text-gray-200">Department *</Label>
          <Select
            value={employee.department_id?.toString() || ""}
            onValueChange={(value) => onChange({ ...employee, department_id: parseInt(value) || 0, designation_id: 0 })}
            disabled={userRole === "Employee"}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="designation_id" className="dark:text-gray-200">Designation *</Label>
          <Select
            value={employee.designation_id?.toString() || ""}
            onValueChange={(value) => onChange({ ...employee, designation_id: parseInt(value) || 0 })}
            disabled={!employee.department_id || userRole === "Employee"}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <SelectValue placeholder="Select Designation" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
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
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EmployeeForm;