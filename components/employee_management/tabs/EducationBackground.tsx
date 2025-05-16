import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Employee, UserRole } from "@/types/employee";
// import { deleteEducationBackground } from "@/services/api/apiEmployee";
// import { getCookie } from "@/lib/auth";

interface EducationBackgroundTabProps {
  employee: Partial<Employee>;
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const EducationBackgroundTab: React.FC<EducationBackgroundTabProps> = ({
  employee,
  onChange,
  userRole,
  isEditMode,
  isEditable,
}) => {
  // Initialize with employee's education_backgrounds or a default entry
  const [educationBackground, setEducationBackground] = useState(() => {
    const edu = employee.education_backgrounds;
    if (Array.isArray(edu) && edu.length > 0) {
      return edu;
    }
    return [{ attainment: "", course: "" }];
  });

  // Track whether the user has modified the education background
  const [isModified, setIsModified] = useState(false);

  // Sync local state with prop changes only if not modified by user
  useEffect(() => {
    if (!isModified) {
      const edu = employee.education_backgrounds;
      if (Array.isArray(edu) && edu.length > 0) {
        setEducationBackground(edu);
      } else {
        setEducationBackground([{ attainment: "", course: "" }]);
      }
    }
  }, [employee.education_backgrounds, isModified]);

  const handleAddEducation = () => {
    const newEducationBackground = [...educationBackground, { attainment: "", course: "" }];
    setEducationBackground(newEducationBackground);
    setIsModified(true); // Mark as modified
    onChange({ ...employee, education_backgrounds: newEducationBackground });
  };

  const handleRemoveEducation = async (index: number) => {
    const education = educationBackground[index];
    try {
      // If the record has an ID, delete it from the backend
      if (education.id) {
        // const token = await getCookie("auth_token"); // Retrieve token from cookies
        // await deleteEducationBackground(education.id, token);
        toast.success("Education record deleted successfully");
      }

      // Update local state
      let newEducationBackground = educationBackground.filter((_, i) => i !== index);
      if (newEducationBackground.length === 0) {
        newEducationBackground = [{ attainment: "", course: "" }];
      }
      setEducationBackground(newEducationBackground);
      setIsModified(true); // Mark as modified
      onChange({ ...employee, education_backgrounds: newEducationBackground });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to delete education record");
      console.error("Delete error:", err);
    }
  };

  const handleEducationChange = (index: number, field: "attainment" | "course", value: string) => {
    const newEducationBackground = [...educationBackground];
    newEducationBackground[index] = { ...newEducationBackground[index], [field]: value };
    setEducationBackground(newEducationBackground);
    setIsModified(true); // Mark as modified
    onChange({ ...employee, education_backgrounds: newEducationBackground });
  };

  return (
    <div className="py-4">
      {educationBackground.map((education, index) => (
        <div key={index} className="grid gap-4 grid-cols-6 mb-4 items-end">
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor={`attainment_${index}`} className="text-foreground dark:text-foreground">
              Educational Attainment
            </Label>
            <Select
              value={education.attainment || ""}
              onValueChange={(value) => handleEducationChange(index, "attainment", value)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectValue placeholder="Select Attainment" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectItem value="Elementary School">Elementary School</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Senior High School">Senior High School</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Doctorate">Doctorate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor={`course_${index}`} className="text-foreground dark:text-foreground">
              Course
            </Label>
            <Input
              id={`course_${index}`}
              value={education.course || ""}
              onChange={(e) => handleEducationChange(index, "course", e.target.value)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
              className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
            />
          </div>
          <div className="col-span-1">
            <Button
              variant="destructive"
              onClick={() => handleRemoveEducation(index)}
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
              className="dark:bg-red-700 dark:hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={handleAddEducation}
        disabled={(!isEditable && isEditMode) || userRole === "Employee"}
        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
      >
        Add Education
      </Button>
    </div>
  );
};

export default EducationBackgroundTab;