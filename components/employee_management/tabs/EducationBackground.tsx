import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";

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
  const [educationBackground, setEducationBackground] = useState(() => {
    return employee.education_background && employee.education_background.length > 0
      ? employee.education_background
      : [{ attainment: "", course: "" }];
  });

  useEffect(() => {
    const newEducationBackground = employee.education_background && employee.education_background.length > 0
      ? employee.education_background
      : [{ attainment: "", course: "" }];
    setEducationBackground(newEducationBackground);
  }, [employee.education_background]);

  const handleAddEducation = () => {
    const newEducationBackground = [...educationBackground, { attainment: "", course: "" }];
    setEducationBackground(newEducationBackground);
    onChange({ ...employee, education_background: newEducationBackground });
  };

  const handleRemoveEducation = (index: number) => {
    let newEducationBackground = educationBackground.filter((_, i) => i !== index);
    if (newEducationBackground.length === 0) {
      newEducationBackground = [{ attainment: "", course: "" }];
    }
    setEducationBackground(newEducationBackground);
    onChange({ ...employee, education_background: newEducationBackground });
  };

  const handleEducationChange = (index: number, field: "attainment" | "course", value: string) => {
    const newEducationBackground = [...educationBackground];
    newEducationBackground[index] = { ...newEducationBackground[index], [field]: value };
    setEducationBackground(newEducationBackground);
    onChange({ ...employee, education_background: newEducationBackground });
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