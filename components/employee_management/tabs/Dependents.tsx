import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";

interface DependentsTabProps {
  employee: Partial<Employee>;
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const DependentsTab: React.FC<DependentsTabProps> = ({
  employee,
  onChange,
  userRole,
  isEditMode,
  isEditable,
}) => {
  const [dependents, setDependents] = useState(() => {
    return employee.dependents && employee.dependents.length > 0
      ? employee.dependents
      : [{ name: "", relationship: "" }];
  });

  useEffect(() => {
    const newDependents = employee.dependents && employee.dependents.length > 0
      ? employee.dependents
      : [{ name: "", relationship: "" }];
    setDependents(newDependents);
  }, [employee.dependents]);

  const handleAddDependent = () => {
    const newDependents = [...dependents, { name: "", relationship: "" }];
    setDependents(newDependents);
    onChange({ ...employee, dependents: newDependents });
  };

  const handleRemoveDependent = (index: number) => {
    let newDependents = dependents.filter((_, i) => i !== index);
    if (newDependents.length === 0) {
      newDependents = [{ name: "", relationship: "" }];
    }
    setDependents(newDependents);
    onChange({ ...employee, dependents: newDependents });
  };

  const handleDependentChange = (index: number, field: "name" | "relationship", value: string) => {
    const newDependents = [...dependents];
    newDependents[index] = { ...newDependents[index], [field]: value };
    setDependents(newDependents);
    onChange({ ...employee, dependents: newDependents });
  };

  return (
    <div className="py-4">
      {dependents.map((dependent, index) => (
        <div key={index} className="grid gap-4 grid-cols-6 mb-4 items-end">
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor={`dependent_name_${index}`} className="text-foreground dark:text-foreground">
              Name
            </Label>
            <Input
              id={`dependent_name_${index}`}
              value={dependent.name || ""}
              onChange={(e) => handleDependentChange(index, "name", e.target.value)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
              className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor={`dependent_relationship_${index}`} className="text-foreground dark:text-foreground">
              Relationship
            </Label>
            <Select
              value={dependent.relationship || ""}
              onValueChange={(value) => handleDependentChange(index, "relationship", value)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Button
              variant="destructive"
              onClick={() => handleRemoveDependent(index)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
              className="dark:bg-red-700 dark:hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={handleAddDependent}
        disabled={(!isEditable && isEditMode) || userRole === "Employee"}
        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
      >
        Add Dependent
      </Button>
    </div>
  );
};

export default DependentsTab;