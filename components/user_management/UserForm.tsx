import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit as EditIcon } from "lucide-react";
import { User, UserRole } from "@/types/employee";
import { toast } from "sonner";

interface UserWithConfirm extends User {
  confirmPassword?: string;
}

interface UserFormProps {
  user: Partial<UserWithConfirm>;
  onChange: (updatedUser: Partial<UserWithConfirm>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
  userRole?: UserRole;
  originalEmail?: string;
  isEditable?: boolean; // Made optional
  setIsEditable?: (value: boolean) => void; // Made optional
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
  originalEmail,
  isEditable = false, // Default to false if not provided
  setIsEditable,
}) => {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [, setLoadingAction] = useState(false);

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailUniqueness = async (email: string) => {
    if (!email || !validateEmailFormat(email) || email === originalEmail) {
      setEmailError(null);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-sanctum-token-here"}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error checking email");
      }

      if (data.exists) {
        setEmailError("This email is already taken.");
      } else {
        setEmailError(null);
      }
    } catch (err) {
      setEmailError("Failed to check email availability.");
      console.error("Email check error:", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onChange({ ...user, email });

    if (!email.trim()) {
      setEmailError("Email is required.");
    } else if (!validateEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
      checkEmailUniqueness(email);
    }
  };

  const validateUser = (): boolean => {
    if (!user?.lastname || user.lastname.trim() === "") {
      toast.error("Last name is required.");
      return false;
    }
    if (user.lastname && user.lastname.length > 255) {
      toast.error("Last name must not exceed 255 characters.");
      return false;
    }

    if (!user?.firstname || user.firstname.trim() === "") {
      toast.error("First name is required.");
      return false;
    }
    if (user.firstname && user.firstname.length > 255) {
      toast.error("First name must not exceed 255 characters.");
      return false;
    }

    if (user?.middlename && user.middlename.length > 255) {
      toast.error("Middle name must not exceed 255 characters.");
      return false;
    }

    if (user?.extension && user.extension.length > 255) {
      toast.error("Extension must not exceed 255 characters.");
      return false;
    }

    if (!user?.email || user.email.trim() === "") {
      toast.error("Email is required.");
      return false;
    }
    if (!validateEmailFormat(user.email || "")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (emailError) {
      toast.error(emailError);
      return false;
    }

    if (!user?.role_name) {
      toast.error("Role is required.");
      return false;
    }

    if (user?.phone_number && user.phone_number.length > 255) {
      toast.error("Phone number must not exceed 255 characters.");
      return false;
    }

    if (!isEditMode) {
      if (!user?.password || user.password.length < 8) {
        toast.error("Password is required and must be at least 8 characters.");
        return false;
      }
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    if (isEditMode && user?.password) {
      if (user.password.length < 8) {
        toast.error("Password must be at least 8 characters if provided.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (validateUser()) {
      setLoadingAction(true);
      try {
        onSave();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleEditClick = () => {
    if (setIsEditable) {
      setIsEditable(true);
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] w-[90vw]">
      <DialogHeader>
        <DialogTitle>{isEditMode ? "View/Edit User" : "Add New User"}</DialogTitle>
        <DialogDescription>
          {isEditMode ? "View or update the user’s details." : "Enter the details for the new user."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-7 py-4 grid-cols-1">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-firstname" : "firstname"}>First Name</Label>
            <Input
              id={isEditMode ? "edit-firstname" : "firstname"}
              value={user?.firstname || ""}
              onChange={(e) => onChange({ ...user, firstname: e.target.value })}
              placeholder="Enter first name"
              required
              disabled={isEditMode && !isEditable} // Simplified logic
              maxLength={255}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-lastname" : "lastname"}>Last Name</Label>
            <Input
              id={isEditMode ? "edit-lastname" : "lastname"}
              value={user?.lastname || ""}
              onChange={(e) => onChange({ ...user, lastname: e.target.value })}
              placeholder="Enter last name"
              required
              disabled={isEditMode && !isEditable}
              maxLength={255}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-middlename" : "middlename"}>Middle Name</Label>
            <Input
              id={isEditMode ? "edit-middlename" : "middlename"}
              value={user?.middlename || ""}
              onChange={(e) => onChange({ ...user, middlename: e.target.value })}
              placeholder="Enter middle name (optional)"
              disabled={isEditMode && !isEditable}
              maxLength={255}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-extension" : "extension"}>Extension</Label>
            <Input
              id={isEditMode ? "edit-extension" : "extension"}
              value={user?.extension || ""}
              onChange={(e) => onChange({ ...user, extension: e.target.value })}
              placeholder="e.g., Jr., Sr. (optional)"
              disabled={isEditMode && !isEditable}
              maxLength={255}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-email" : "email"}>Email</Label>
            <Input
              id={isEditMode ? "edit-email" : "email"}
              type="email"
              value={user?.email || ""}
              onChange={handleEmailChange}
              onBlur={() => checkEmailUniqueness(user?.email || "")}
              placeholder="Enter email address"
              required
              disabled={isEditMode && !isEditable}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            {isCheckingEmail && <p className="text-gray-500 text-sm">Checking email...</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-role_name" : "role_name"}>Role</Label>
            <Select
              value={user?.role_name || ""}
              onValueChange={(value) => onChange({ ...user, role_name: value })}
              disabled={isEditMode && !isEditable}
            >
              <SelectTrigger id={isEditMode ? "edit-role_name" : "role_name"}>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-phone_number" : "phone_number"}>Phone Number</Label>
            <Input
              id={isEditMode ? "edit-phone_number" : "phone_number"}
              value={user?.phone_number || ""}
              onChange={(e) => onChange({ ...user, phone_number: e.target.value })}
              placeholder="Enter phone number (optional)"
              disabled={isEditMode && !isEditable}
              maxLength={255}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={isEditMode ? "edit-password" : "password"}>Password</Label>
            <Input
              id={isEditMode ? "edit-password" : "password"}
              type="password"
              value={user?.password || ""}
              onChange={(e) => onChange({ ...user, password: e.target.value })}
              placeholder={isEditMode ? "Leave blank to keep unchanged" : "Min 8 characters"}
              required={!isEditMode}
              disabled={isEditMode && !isEditable}
            />
          </div>
          {!isEditMode && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={user?.confirmPassword || ""}
                onChange={(e) => onChange({ ...user, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isCheckingEmail || isSaving}>
            Cancel
          </Button>
          {(isEditMode ? isEditable : true) && (
            <Button
              onClick={handleSave}
              disabled={isCheckingEmail || isSaving}
              className="relative"
            >
              {isSaving && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-white" /> Saving...
                </span>
              )}
              <span className={isSaving ? "opacity-0" : "opacity-100"}>
                {isEditMode ? "Save Changes" : "Save"}
              </span>
            </Button>
          )}
        </div>

        {isEditMode && !isEditable && (
          <Button
            onClick={handleEditClick}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default UserForm;