import { useRef, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit as EditIcon } from "lucide-react";
import { Designation, Department, UserRole } from "@/types/employee";

interface DesignationFormProps {
  designation: Partial<Designation>;
  departments: Department[];
  onChange: (updatedDesignation: Partial<Designation>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  userRole: UserRole;
  isEditMode?: boolean;
  isEditable?: boolean;
  setIsEditable?: (value: boolean) => void;
}

const DesignationForm: React.FC<DesignationFormProps> = ({
  designation,
  departments,
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

  // Validate input fields
  const isValid = designation.designation?.trim() && designation.department_id !== undefined && designation.department_id !== 0;

  return (
    <DialogContent className="sm:max-w-[600px] w-[90vw] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-foreground">
          {isEditMode ? "View/Edit Designation" : "Add New Designation"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground dark:text-gray-300">
          {isEditMode ? "View or update the designation details." : "Enter the details for the new designation."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={isEditMode ? "edit-designation" : "designation"} className="text-foreground dark:text-foreground">
            Designation Name
          </Label>
          <Input
            id={isEditMode ? "edit-designation" : "designation"}
            value={designation.designation || ""}
            onChange={(e) => onChange({ ...designation, designation: e.target.value })}
            placeholder="e.g., Web Developer"
            required
            disabled={isEditMode && !isEditable}
            maxLength={255}
            className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="department" className="text-foreground dark:text-foreground">
            Department
          </Label>
          <Select
            value={designation.department_id ? designation.department_id.toString() : ""}
            onValueChange={(value) => onChange({ ...designation, department_id: parseInt(value) })}
            disabled={isEditMode && !isEditable}
          >
            <SelectTrigger
              id="department"
              className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
            >
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.department}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="0" disabled>
                  No departments available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
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
              disabled={isSaving || !isValid}
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

export default DesignationForm;