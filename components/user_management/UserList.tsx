"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Archive, Plus, UserCheck, UserX } from "lucide-react";
import UserForm from "./UserForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { User, UserRole } from "@/types/employee";
import { useUserData } from "@/hooks/useUserData";
import UserTable from "./UserTable";
import CustomTabsTable from "../custom_components/CustomTabsTable";

type SortKey = keyof User;

const UserList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { users, pagination, loading, error, fetchUsers, addUser, editUser, removeUser } = useUserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User & { confirmPassword?: string } | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User & { confirmPassword?: string }>>({
    lastname: "",
    firstname: "",
    middlename: "",
    extension: "",
    email: "",
    company_id_number: "",
    role_name: "Employee",
    profile_image: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleAddUser = async () => {
    setIsSaving(true);
    try {
      const payload = { ...newUser };
      delete payload.confirmPassword;
      await addUser(payload);
      setIsAddModalOpen(false);
      setNewUser({
        lastname: "",
        firstname: "",
        middlename: "",
        extension: "",
        email: "",
        company_id_number: "",
        role_name: "Employee",
        profile_image: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
      });
      toast.success("User added successfully");
      if (userRole === "Employee") toast.info("Your profile has been submitted for review");
    } catch (err) {
      toast.error("Failed to add user");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const payload = { ...selectedUser };
      delete payload.confirmPassword;
      await editUser(selectedUser.id, payload);
      setIsViewModalOpen(false);
      setSelectedUser(null);
      setIsEditable(false);
      toast.success("User updated successfully");
      if (userRole === "Employee") toast.info("Your profile has been updated");
    } catch (err) {
      toast.error("Failed to update user");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await removeUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    setIsEditable(false); // Ensure non-editable on open
  };

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
          user.middlename || "",
          user.extension || "",
          user.email,
          user.company_id_number || "",
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
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
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

  const totalPages = pagination.last_page;

  const getUserTableContent = (filteredUsers: User[]) => (
    <UserTable
      users={filteredUsers}
      loading={loading}
      handleEdit={() => {}}
      handleDelete={(user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
      }}
      handleViewProfile={handleViewProfile}
      sortConfig={sortConfig}
      handleSort={handleSort}
    />
  );

  const tabsData = [
    {
      label: "Active Users",
      value: "active",
      icon: UserCheck,
      content: getUserTableContent(filteredAndSortedUsers.filter((user) => user.is_active > 0)),
    },
    {
      label: "Inactive Users",
      value: "inactive",
      icon: UserX,
      content: getUserTableContent(filteredAndSortedUsers.filter((user) => user.is_active < 1)),
    },
    {
      label: "Archived Users",
      value: "archived",
      icon: Archive,
      content: getUserTableContent(filteredAndSortedUsers.filter((user) => user.employment_status === "archived")),
    },
  ];

  return (
    <div className="flex flex-col items-center bg-background text-foreground">
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
      <div className="w-full max-w-6xl mb-4">
        <CustomTabsTable tabs={tabsData}/>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <UserForm
          user={newUser}
          onChange={setNewUser}
          onSave={handleAddUser}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setIsEditable(false);
            setSelectedUser(null);
          }
        }}
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onChange={(updatedUser) => setSelectedUser(updatedUser as User & { confirmPassword?: string })}
            onSave={handleUpdateUser}
            onCancel={() => setIsViewModalOpen(false)}
            isSaving={isSaving}
            isEditMode
            userRole={userRole}
            originalEmail={selectedUser.email}
            isEditable={isEditable}
            setIsEditable={setIsEditable}
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeleteUser}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default UserList;