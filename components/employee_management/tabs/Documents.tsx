import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, UserRole } from "@/types/employee";

interface DocumentsTabProps {
  employee: Partial<Employee>;
  onChange: (updatedEmployee: Partial<Employee>) => void;
  userRole: UserRole;
  isEditMode: boolean;
  isEditable: boolean;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({
  employee,
  onChange,
  userRole,
  isEditMode,
  isEditable,
}) => {
  const handleFileChange = (type: string, file: File | null) => {
    const existingDocs = Array.isArray(employee.documents) ? employee.documents : [];
    const updatedDocs = file ? [...existingDocs, { type, file }] : existingDocs;
    onChange({ ...employee, documents: updatedDocs });
  };

  return (
    <div className="grid gap-4 py-4 grid-cols-6">
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="resume" className="text-foreground dark:text-foreground">Resume</Label>
        <Input
          id="resume"
          type="file"
          onChange={(e) => handleFileChange('resume', e.target.files?.[0] || null)}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="id_proof" className="text-foreground dark:text-foreground">ID Proof</Label>
        <Input
          id="id_proof"
          type="file"
          onChange={(e) => handleFileChange('id_proof', e.target.files?.[0] || null)}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <Label htmlFor="certificates" className="text-foreground dark:text-foreground">Certificates</Label>
        <Input
          id="certificates"
          type="file"
          onChange={(e) => handleFileChange('certificates', e.target.files?.[0] || null)}
          disabled={(!isEditable && isEditMode) || userRole === "Employee"}
          className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
        />
      </div>
    </div>
  );
};

export default DocumentsTab;