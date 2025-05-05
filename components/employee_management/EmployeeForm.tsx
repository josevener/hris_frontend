import { useRef, useEffect, useState } from "react";
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Edit as EditIcon } from "lucide-react";
import { Department, Designation, Employee, User, UserRole } from "@/types/employee";
import PersonalTab from "./tabs/Personal";
import EmploymentTab from "./tabs/Employment";
import GovernmentTab from "./tabs/Government";
import DependentsTab from "./tabs/Dependents";
import EducationBackgroundTab from "./tabs/EducationBackground";
import DocumentsTab from "./tabs/Documents";

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
  isEditable?: boolean;
  setIsEditable?: (value: boolean) => void;
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
  isEditable = false,
  setIsEditable,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Move focus to the Cancel button when the sheet opens
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
    <SheetContent
      side="bottom"
      className="w-full h-[450px] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700 rounded-t-lg flex flex-col"
    >
      <SheetHeader className="flex-shrink-0">
        <SheetTitle className="text-foreground dark:text-foreground">
          {isEditMode ? "View/Edit Employee" : "Add New Employee"}
        </SheetTitle>
        <SheetDescription className="text-muted-foreground dark:text-gray-300">
          {isEditMode ? "View or update the employee’s details." : "Enter the details for the new employee."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-6 border-b dark:border-gray-700 flex-shrink-0">
            <TabsTrigger value="personal" className="dark:text-foreground dark:hover:bg-gray-700">Personal Details</TabsTrigger>
            <TabsTrigger value="employment" className="dark:text-foreground dark:hover:bg-gray-700">Employment</TabsTrigger>
            <TabsTrigger value="government" className="dark:text-foreground dark:hover:bg-gray-700">Government</TabsTrigger>
            <TabsTrigger value="dependents" className="dark:text-foreground dark:hover:bg-gray-700">Dependents</TabsTrigger>
            <TabsTrigger value="education" className="dark:text-foreground dark:hover:bg-gray-700">Education</TabsTrigger>
            <TabsTrigger value="documents" className="dark:text-foreground dark:hover:bg-gray-700">Documents</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-2">
            <TabsContent value="personal" className="mt-0">
              <PersonalTab
                employee={employee}
                users={users}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>

            <TabsContent value="employment" className="mt-0">
              <EmploymentTab
                employee={employee}
                departments={departments}
                designations={designations}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>

            <TabsContent value="government" className="mt-0">
              <GovernmentTab
                employee={employee}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>

            <TabsContent value="dependents" className="mt-0">
              <DependentsTab
                employee={employee}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              <EducationBackgroundTab
                employee={employee}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentsTab
                employee={employee}
                onChange={onChange}
                userRole={userRole}
                isEditMode={isEditMode}
                isEditable={isEditable}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <SheetFooter className="flex justify-between gap-2 pt-4 flex-shrink-0">
        {isEditMode && !isEditable && (
          <Button
            onClick={handleEditClick}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          {(isEditMode ? isEditable : true) && (
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
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </SheetFooter>
    </SheetContent>
  );
};

export default EmployeeForm;