import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  lastname: string;
  firstname: string;
  middlename: string;
  extension: string;
  email: string;
  company_id_number: string;
  role_name: string;
  profile_image?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  password?: string;
}

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: Partial<User>;
  setUser: (user: Partial<User>) => void;
  onSave: () => void;
  isEdit?: boolean;
  userRole?: "Employee" | "HR" | "Admin";
}

// Combined Add/Edit Modal Component
const UserModal: React.FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  user,
  setUser,
  onSave,
  isEdit = false,
  userRole,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user’s details." : "Enter the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-lastname" : "lastname"}>Last Name</Label>
              <Input
                id={isEdit ? "edit-lastname" : "lastname"}
                value={user.lastname || ""}
                onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                placeholder="Enter last name"
                required
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-firstname" : "firstname"}>First Name</Label>
              <Input
                id={isEdit ? "edit-firstname" : "firstname"}
                value={user.firstname || ""}
                onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                placeholder="Enter first name"
                required
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-middlename" : "middlename"}>Middle Name</Label>
              <Input
                id={isEdit ? "edit-middlename" : "middlename"}
                value={user.middlename || ""}
                onChange={(e) => setUser({ ...user, middlename: e.target.value })}
                placeholder="Enter middle name (optional)"
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-extension" : "extension"}>Extension</Label>
              <Input
                id={isEdit ? "edit-extension" : "extension"}
                value={user.extension || ""}
                onChange={(e) => setUser({ ...user, extension: e.target.value })}
                placeholder="e.g., Jr., Sr. (optional)"
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-email" : "email"}>Email</Label>
              <Input
                id={isEdit ? "edit-email" : "email"}
                type="email"
                value={user.email || ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter email address"
                required
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-company_id_number" : "company_id_number"}>
                Employee ID
              </Label>
              <Input
                id={isEdit ? "edit-company_id_number" : "company_id_number"}
                value={user.company_id_number || ""}
                onChange={(e) => setUser({ ...user, company_id_number: e.target.value })}
                placeholder="Enter employee ID"
                required
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-role_name" : "role_name"}>Role</Label>
              <Select
                value={user.role_name || ""}
                onValueChange={(value) => setUser({ ...user, role_name: value })}
                disabled={isEdit && userRole === "Employee"}
              >
                <SelectTrigger id={isEdit ? "edit-role_name" : "role_name"}>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-phone_number" : "phone_number"}>Phone Number</Label>
              <Input
                id={isEdit ? "edit-phone_number" : "phone_number"}
                value={user.phone_number || ""}
                onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                placeholder="Enter phone number (optional)"
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            {!isEdit && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={user.password || ""}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="Enter password (min 8 characters)"
                  required
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {isEdit ? "Save Changes" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};