import { useRef, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Edit as EditIcon } from "lucide-react";
import { Department, UserRole } from "@/types/employee";

interface DepartmentFormProps {
  department: Partial<Department>;
  onChange: (updatedDepartment: Partial<Department>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  userRole: UserRole;
  isEditMode?: boolean;
  isEditable?: boolean;
  setIsEditable?: (value: boolean) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  onChange,
  onSave,
  onCancel,
  isSaving,
  userRole,
  isEditMode = false,
  isEditable = false,
  setIsEditable,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the Cancel button when the dialog opens
  useEffect(() => {
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, []);

  const handleEditClick = () => {
    if (setIsEditable) {
      setIsEditable(true);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] w-[90vw] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-foreground">
          {isEditMode ? "View/Edit Department" : "Add New Department"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground dark:text-gray-300">
          {isEditMode ? "View or update the department details." : "Enter the details for the new department."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={isEditMode ? "edit-department" : "department"} className="text-foreground dark:text-foreground">
            Department Name
          </Label>
          <Input
            id={isEditMode ? "edit-department" : "department"}
            value={department.department || ""}
            onChange={(e) => onChange({ ...department, department: e.target.value })}
            placeholder="Enter department name"
            required
            disabled={isEditMode && !isEditable}
            maxLength={255}
            className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
        </div>
      </div>
      <DialogFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          {(isEditMode ? isEditable : true) && (userRole === "HR" || userRole === "Admin") && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                isEditMode ? "Save Changes" : "Save"
              )}
            </Button>
          )}
        </div>
        {isEditMode && !isEditable && (userRole === "HR" || userRole === "Admin") && (
          <Button
            onClick={handleEditClick}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default DepartmentForm;