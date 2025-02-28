"use client";

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Edit,
  MoreVertical,
  Trash,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { Skeleton } from "../ui/skeleton";

// Extended User Interface
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

type SortKey = keyof User;
type SortValue = string | number | undefined;
type UserRole = "Employee" | "HR" | "Admin";
type UserWithConfirm = User & { confirmPassword?: string };

// Reusable User Modal Component
interface UserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: Partial<UserWithConfirm> | null;
  setUser: Dispatch<SetStateAction<Partial<UserWithConfirm> | null>>;
  onSave: () => void;
  isEdit?: boolean;
  userRole?: UserRole;
  originalEmail?: string; // Add original email for comparison
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onOpenChange,
  user,
  setUser,
  onSave,
  isEdit = false,
  userRole,
  originalEmail, // Receive original email from parent
}) => {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Validate email format
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email uniqueness against backend
  const checkEmailUniqueness = async (email: string) => {
    if (!email || !validateEmailFormat(email) || email === originalEmail) {
      setEmailError(null); // Clear error if email is unchanged or invalid
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
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

  // Handle email input change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setUser((prev) => ({ ...prev, email }));

    if (!email.trim()) {
      setEmailError("Email is required.");
    } else if (!validateEmailFormat(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
      checkEmailUniqueness(email); // Always check uniqueness, even in edit mode
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

    if (!isEdit) {
      if (!user?.password || user.password.length < 8) {
        toast.error("Password is required and must be at least 8 characters.");
        return false;
      }
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    if (isEdit && user?.password) {
      if (user.password.length < 8) {
        toast.error("Password must be at least 8 characters if provided.");
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (validateUser()) {
      onSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user’s details." : "Enter the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-7 py-4 grid-cols-1">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-firstname" : "firstname"}>First Name</Label>
              <Input
                id={isEdit ? "edit-firstname" : "firstname"}
                value={user?.firstname || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, firstname: e.target.value }))}
                placeholder="Enter first name"
                required
                disabled={isEdit && userRole === "Employee"}
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-lastname" : "lastname"}>Last Name</Label>
              <Input
                id={isEdit ? "edit-lastname" : "lastname"}
                value={user?.lastname || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, lastname: e.target.value }))}
                placeholder="Enter last name"
                required
                disabled={isEdit && userRole === "Employee"}
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-middlename" : "middlename"}>Middle Name</Label>
              <Input
                id={isEdit ? "edit-middlename" : "middlename"}
                value={user?.middlename || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, middlename: e.target.value }))}
                placeholder="Enter middle name (optional)"
                disabled={isEdit && userRole === "Employee"}
                maxLength={255}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-extension" : "extension"}>Extension</Label>
              <Input
                id={isEdit ? "edit-extension" : "extension"}
                value={user?.extension || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, extension: e.target.value }))}
                placeholder="e.g., Jr., Sr. (optional)"
                disabled={isEdit && userRole === "Employee"}
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-email" : "email"}>Email</Label>
              <Input
                id={isEdit ? "edit-email" : "email"}
                type="email"
                value={user?.email || ""}
                onChange={handleEmailChange}
                onBlur={() => checkEmailUniqueness(user?.email || "")}
                placeholder="Enter email address"
                required
                disabled={isEdit && userRole === "Employee"}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
              {isCheckingEmail && (
                <p className="text-gray-500 text-sm">Checking email...</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-role_name" : "role_name"}>Role</Label>
              <Select
                value={user?.role_name || ""}
                onValueChange={(value) => setUser((prev) => ({ ...prev, role_name: value }))}
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
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-phone_number" : "phone_number"}>Phone Number</Label>
              <Input
                id={isEdit ? "edit-phone_number" : "phone_number"}
                value={user?.phone_number || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, phone_number: e.target.value }))}
                placeholder="Enter phone number (optional)"
                disabled={isEdit && userRole === "Employee"}
                maxLength={255}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={isEdit ? "edit-password" : "password"}>Password</Label>
              <Input
                id={isEdit ? "edit-password" : "password"}
                type="password"
                value={user?.password || ""}
                onChange={(e) => setUser((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={isEdit ? "Leave blank to keep unchanged" : "Min 8 characters"}
                required={!isEdit}
                disabled={isEdit && userRole === "Employee"}
              />
            </div>
            {!isEdit && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={user?.confirmPassword || ""}
                  onChange={(e) => setUser((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
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
          <Button onClick={handleSave} disabled={isCheckingEmail}>
            {isEdit ? "Save Changes" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Rest of UserList remains unchanged (omitted for brevity)
export default function UserList({ userRole = "Admin" }: { userRole?: UserRole }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<UserWithConfirm> | null>(null);
  const [newUser, setNewUser] = useState<Partial<UserWithConfirm> | null>({
    lastname: "",
    firstname: "",
    middlename: "",
    extension: "",
    email: "",
    role_name: "",
    profile_image: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const itemsPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = async () => {
    try {
      const payload = {
        lastname: newUser?.lastname,
        firstname: newUser?.firstname,
        middlename: newUser?.middlename || null,
        extension: newUser?.extension || null,
        email: newUser?.email,
        role_name: newUser?.role_name,
        profile_image: newUser?.profile_image || null,
        phone_number: newUser?.phone_number || null,
        password: newUser?.password,
      };

      console.log("Adding user with payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to add user");
      }

      const addedUser = await response.json();
      console.log("Added user:", addedUser);

      setUsers((prevUsers) => [...prevUsers, addedUser]);
      setIsAddModalOpen(false);
      setNewUser(null);
      toast.success("User added successfully");
      if (userRole === "Employee") {
        toast.info("Your profile has been submitted for review");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add user");
      console.error("Add error:", err);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const payload = {
        lastname: selectedUser.lastname,
        firstname: selectedUser.firstname,
        middlename: selectedUser.middlename || null,
        extension: selectedUser.extension || null,
        email: selectedUser.email,
        company_id_number: selectedUser.company_id_number,
        role_name: selectedUser.role_name,
        profile_image: selectedUser.profile_image || null,
        phone_number: selectedUser.phone_number || null,
        ...(selectedUser.password && { password: selectedUser.password }),
      };

      const response = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
      if (userRole === "Employee") {
        toast.info("Your profile has been updated");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
      console.error("Update error:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
      console.error("Delete error:", err);
    }
  };

  const handleViewProfile = (user: User) => {
    console.log(`View Profile: ${user.id}`);
    toast.info("View profile functionality to be implemented");
  };

  const getSortValue = (user: User, key: SortKey): SortValue => user[key];

  const getFullName = (user: User): string =>
    `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter((user) =>
        [
          user.lastname,
          user.firstname,
          user.middlename,
          user.extension,
          user.email,
          user.company_id_number,
          user.role_name,
          user.phone_number || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [users, searchTerm, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(start, start + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  const SortIcon = ({ column }: { column: SortKey }) =>
    sortConfig?.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 inline" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4 inline" />
      )
    ) : null;

  return (
    <div className="px-4 flex flex-col items-center">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="w-full max-w-6xl overflow-x-auto">
        <Table className="w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <TableCaption className="text-muted-foreground pb-2">List of registered users.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100">
              <TableHead
                className="w-[50px] cursor-pointer font-semibold"
                onClick={() => handleSort("id")}
              >
                # <SortIcon column="id" />
              </TableHead>
              <TableHead
                className="w-[120px] cursor-pointer font-semibold"
                onClick={() => handleSort("company_id_number")}
              >
                Employee No. <SortIcon column="company_id_number" />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => handleSort("lastname")}
              >
                Name <SortIcon column="lastname" />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => handleSort("email")}
              >
                Email <SortIcon column="email" />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold"
                onClick={() => handleSort("created_at")}
              >
                Joined Date <SortIcon column="created_at" />
              </TableHead>
              <TableHead className="w-[50px] text-center font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&>tr]:border-b">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableRow
                  key={`skeleton-${index}`}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-900"
                  } opacity-75`}
                >
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-6 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={`${
                    users.indexOf(user) % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.company_id_number}</TableCell>
                  <TableCell>{getFullName(user)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary">
                        <MoreVertical className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                          <FileText className="w-4 h-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        {(userRole === "HR" || userRole === "Admin" || userRole === "Employee") && (
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {(userRole === "HR" || userRole === "Admin") && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-500"
                          >
                            <Trash className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="no-users" className="bg-white dark:bg-gray-800">
                <TableCell colSpan={6} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <UserModal
        key="add-user-modal"
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        user={newUser}
        setUser={setNewUser}
        onSave={handleAddUser}
      />
      <UserModal
        key="edit-user-modal"
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        setUser={setSelectedUser}
        onSave={handleUpdateUser}
        isEdit
        userRole={userRole}
        originalEmail={selectedUser?.email} // Pass original email
      />
      <Dialog key="delete-user-modal" open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
           <DialogDescription>
              <br />
              <span>Are you sure you want to delete this record?</span>
              <br /> <br />
              <span>This will also remove its associated data in Employee Management.</span> 
              <br /> <br />
              <span>This action cannot be undone.</span>
           </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}