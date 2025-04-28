import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Employee, User, UserRole } from "@/types/employee";

interface PersonalTabProps {
  employee: Partial<Employee>;
  users: User[];
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const PersonalTab: React.FC<PersonalTabProps> = ({
  employee,
  users,
  onChange,
  userRole,
  isEditMode,
  isEditable,
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
    <div className="grid gap-4 py-4 grid-cols-6">
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="user_id" className="text-foreground dark:text-foreground">Employee Name *</Label>
        {isEditMode ? (
          <Input
            id="edit-user_id"
            value={getFullName(employee as Employee)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        ) : (
          <Select
            value={employee.user_id?.toString() || ""}
            onValueChange={(value) => onChange({ ...employee, user_id: parseInt(value) || 0 })}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
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
        <Label htmlFor="company_id_number" className="text-foreground dark:text-foreground">Employee ID</Label>
        <Input
          id="company_id_number"
          value={isEditMode ? employee.company_id_number || "" : employee.user_id ? getUserCompanyId(employee.user_id) : ""}
          disabled
          className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="gender" className="text-foreground dark:text-foreground">Gender</Label>
        <Select
          value={employee.gender || "none"}
          onValueChange={(value) => onChange({ ...employee, gender: value === "none" ? null : value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
        >
          <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="birthdate" className="text-foreground dark:text-foreground">Birthdate</Label>
        <Input
          id="birthdate"
          type="date"
          value={employee.birthdate || ""}
          onChange={(e) => onChange({ ...employee, birthdate: e.target.value || null })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-4 flex flex-col gap-2">
        <Label htmlFor="address" className="text-foreground dark:text-foreground">Address</Label>
        <Input
          id="address"
          value={employee.address || ""}
          onChange={(e) => onChange({ ...employee, address: e.target.value })}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
    </div>
  );
};

export default PersonalTab;