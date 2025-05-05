import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";
import { getCookie } from "@/lib/auth";
import { deleteDocument } from "@/services/api/apiEmployee";
import { toast } from "sonner";

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
  const [documents, setDocuments] = useState<{ id?: number; type: string; file: File | null; file_path?: string }[]>(() => {
    const defaultDocs = [
      { type: "resume", file: null },
      { type: "id_proof", file: null },
      { type: "certificates", file: null },
    ];

    if (isEditMode && employee.documents && employee.documents.length > 0) {
      return defaultDocs.map((defaultDoc) => {
        const existingDoc = employee.documents!.find((doc) => doc.type === defaultDoc.type);
        if (existingDoc) {
          return {
            id: existingDoc.id,
            type: existingDoc.type,
            file: null,
            file_path: existingDoc.file_path,
          };
        }
        return defaultDoc;
      });
    }

    return defaultDocs;
  });

  const [deletingType, setDeletingType] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && employee.documents && employee.documents.length > 0) {
      const updatedDocs = documents.map((doc) => {
        const existingDoc = employee.documents!.find((d) => d.type === doc.type);
        if (existingDoc && !doc.file && !doc.file_path) {
          return {
            ...doc,
            id: existingDoc.id,
            file_path: existingDoc.file_path,
          };
        }
        return doc;
      });
      setDocuments(updatedDocs);
    }
  }, [employee.documents, isEditMode]);

  const handleFileChange = (type: string, file: File | null) => {
    const updatedDocs = documents.map((doc) =>
      doc.type === type ? { ...doc, file, file_path: file ? undefined : doc.file_path } : doc
    );
    setDocuments(updatedDocs);

    const newDocs = updatedDocs
      .filter((doc) => doc.file || doc.file_path)
      .map((doc) => ({
        id: doc.id,
        type: doc.type,
        file: doc.file || undefined,
        file_path: doc.file_path,
      }));

    onChange({ ...employee, documents: newDocs });
  };

  const handleRemoveFile = async (type: string) => {
    setDeletingType(type);
    const token = await getCookie("auth_token");

    const docToDelete = documents.find((doc) => doc.type === type && doc.id);
    if (docToDelete && token) {
      try {
        await deleteDocument(Number(docToDelete.id), token);
        toast.success("Document deleted successfully");
      } catch (error) {
        toast.error("Failed to delete document");
        console.error("Delete error:", error);
      }
    }

    const updatedDocs = documents.map((doc) =>
      doc.type === type ? { ...doc, file: null, file_path: undefined } : doc
    );

    setDocuments(updatedDocs);

    const newDocs = updatedDocs
      .filter((doc) => doc.file || doc.file_path)
      .map((doc) => ({
        id: doc.id,
        type: doc.type,
        file: doc.file || undefined,
        file_path: doc.file_path,
      }));

    onChange({ ...employee, documents: newDocs });
    setDeletingType(null);
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
          {doc.file || doc.file_path ? (
            <div className="flex items-center gap-2">
              <span className="text-foreground dark:text-foreground truncate max-w-[150px]">
                {doc.file ? doc.file.name : doc.file_path?.split("/").pop()}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFile(doc.type)}
                disabled={
                  deletingType === doc.type || (!isEditable && isEditMode) || userRole === "Employee"
                }
                className="dark:bg-red-700 dark:hover:bg-red-600"
              >
                <Trash2
                  className={`h-4 w-4 transition-transform ${
                    deletingType === doc.type ? "animate-spin" : ""
                  }`}
                />
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
