import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  // Initialize state for each document type
  const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([
    { type: "resume", file: null },
    { type: "id_proof", file: null },
    { type: "certificates", file: null },
  ]);

  // Sync with employee.documents if provided
  const handleFileChange = (type: string, file: File | null) => {
    const updatedDocs = documents.map((doc) =>
      doc.type === type ? { ...doc, file } : doc
    );
    setDocuments(updatedDocs);

    // Update employee.documents with the new file list
    const newDocs = updatedDocs
      .filter((doc) => doc.file !== null)
      .map((doc) => ({ type: doc.type, file: doc.file! }));
    onChange({ ...employee, documents: newDocs });
  };

  const handleRemoveFile = (type: string) => {
    const updatedDocs = documents.map((doc) =>
      doc.type === type ? { ...doc, file: null } : doc
    );
    setDocuments(updatedDocs);

    // Update employee.documents by filtering out the removed file
    const newDocs = updatedDocs
      .filter((doc) => doc.file !== null)
      .map((doc) => ({ type: doc.type, file: doc.file! }));
    onChange({ ...employee, documents: newDocs });
  };

  return (
    <div className="grid gap-4 py-4 grid-cols-6">
      {documents.map((doc) => (
        <div key={doc.type} className="col-span-2 flex flex-col gap-2">
          <Label
            htmlFor={doc.type}
            className="text-foreground dark:text-foreground capitalize"
          >
            {doc.type.replace("_", " ")}
          </Label>
          {doc.file ? (
            <div className="flex items-center gap-2">
              <span className="text-foreground dark:text-foreground truncate max-w-[150px]">
                {doc.file.name}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFile(doc.type)}
                disabled={(!isEditable && isEditMode) || userRole === "Employee"}
                className="dark:bg-red-700 dark:hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              id={doc.type}
              type="file"
              onChange={(e) =>
                handleFileChange(doc.type, e.target.files?.[0] || null)
              }
              disabled={(!isEditable && isEditMode) || userRole === "Employee"}
              className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentsTab;