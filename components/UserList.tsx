// "use client";

// import { useState, useMemo } from "react";
// import { Toaster } from "sonner";
// import { User, SortKey, UserRole } from "@/types/employee";
// import { useEntityData } from "@/hooks/useEntityData";
// import GenericTable from "./GenericTable";
// import GenericModal from "./GenericModal";
// import { createEntityHandler, updateEntityHandler, deleteEntityHandler, viewEntityHandler, sortHandler } from "@/utils/entityHandlers";
// import { filterAndSortEntities } from "@/utils/entityUtils";
// import { Input } from "./ui/input";

// const fetchUsers = async (): Promise<User[]> => {
//   const response = await fetch("http://127.0.0.1:8000/api/users", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     credentials: "include",
//     cache: "no-store",
//   });
//   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//   return response.json();
// };

// const createUser = async (data: Partial<User>) => {
//   const response = await fetch("http://127.0.0.1:8000/api/users", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     credentials: "include",
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "Failed to add user");
//   }
//   return response.json();
// };

// const updateUser = async (id: number, data: Partial<User>) => {
//   const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     credentials: "include",
//     body: JSON.stringify(data),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "Failed to update user");
//   }
//   return response.json();
// };

// const deleteUser = async (id: number) => {
//   const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
//     method: "DELETE",
//     headers: { "Content-Type": "application/json", Accept: "application/json" },
//     credentials: "include",
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "Failed to delete user");
//   }
// };

// type UserWithConfirm = User & { confirmPassword?: string };

// const UserList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
//   const { items: users, loading, error, setItems: setUsers } = useEntityData<User>(fetchUsers);
//   const [tableState, setTableState] = useState({
//     searchTerm: "",
//     sortConfig: null as { key: SortKey; direction: "asc" | "desc" } | null,
//     currentPage: 1,
//   });
//   const [modalState, setModalState] = useState({
//     isAddModalOpen: false,
//     isEditModalOpen: false,
//     isDeleteModalOpen: false,
//   });
//   const [formState, setFormState] = useState({
//     selectedUser: null as Partial<UserWithConfirm> | null,
//     newUser: {
//       lastname: "",
//       firstname: "",
//       middlename: "",
//       extension: "",
//       email: "",
//       role_name: "",
//       profile_image: "",
//       phone_number: "",
//       password: "",
//       confirmPassword: "",
//     } as Partial<UserWithConfirm>,
//   });
//   const [loadingState, setLoadingState] = useState({
//     isAdding: false,
//     isUpdating: false,
//     isDeleting: false,
//   });

//   const itemsPerPage = 6;

//   const handleAdd = createEntityHandler<User>({
//     items: users,
//     setItems: setUsers,
//     setLoading: (value) => setLoadingState((prev) => ({ ...prev, isAdding: value })),
//     setModalOpen: (value) => setModalState((prev) => ({ ...prev, isAddModalOpen: value })),
//     setEntityData: (data) => setFormState((prev) => ({ ...prev, newUser: data ?? prev.newUser })),
//     createFn: createUser,
//     onSuccess: (action) => userRole === "Employee" && action === "add" && toast.info("Your profile has been submitted for review"),
//   });

//   const handleUpdate = updateEntityHandler<User>({
//     items: users,
//     setItems: setUsers,
//     setLoading: (value) => setLoadingState((prev) => ({ ...prev, isUpdating: value })),
//     setModalOpen: (value) => setModalState((prev) => ({ ...prev, isEditModalOpen: value })),
//     setEntityData: (data) => setFormState((prev) => ({ ...prev, selectedUser: data })),
//     updateFn: updateUser,
//     onSuccess: (action) => userRole === "Employee" && action === "update" && toast.info("Your profile has been updated"),
//   });

//   const handleDelete = deleteEntityHandler<User>({
//     items: users,
//     setItems: setUsers,
//     setLoading: (value) => setLoadingState((prev) => ({ ...prev, isDeleting: value })),
//     setModalOpen: (value) => setModalState((prev) => ({ ...prev, isDeleteModalOpen: value })),
//     setEntityData: (data) => setFormState((prev) => ({ ...prev, selectedUser: data })),
//     deleteFn: deleteUser,
//   });

//   const handleView = viewEntityHandler;
//   const handleSort = sortHandler(setTableState);

//   const filteredAndSortedUsers = useMemo(
//     () =>
//       filterAndSortEntities<User>(users, tableState.searchTerm, tableState.sortConfig, [
//         "lastname",
//         "firstname",
//         "middlename",
//         "extension",
//         "email",
//         "company_id_number",
//         "role_name",
//         "phone_number",
//       ]),
//     [users, tableState.searchTerm, tableState.sortConfig]
//   );

//   const paginatedUsers = useMemo(() => {
//     const start = (tableState.currentPage - 1) * itemsPerPage;
//     return filteredAndSortedUsers.slice(start, start + itemsPerPage);
//   }, [filteredAndSortedUsers, tableState.currentPage]);

//   const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

//   const columns = [
//     { key: "id" as const, label: "#" },
//     { key: "company_id_number" as const, label: "Employee No." },
//     {
//       key: "lastname" as const,
//       label: "Name",
//       render: (user: User) =>
//         `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim(),
//     },
//     { key: "email" as const, label: "Email" },
//     {
//       key: "created_at" as const,
//       label: "Joined Date",
//       render: (user: User) => new Date(user.created_at).toLocaleDateString(),
//     },
//     { key: "actions" as const, label: "Actions" },
//   ];

//   const renderUserForm = (user: Partial<UserWithConfirm> | null, setUser: React.Dispatch<React.SetStateAction<Partial<UserWithConfirm> | null>>) => (
//     <div className="grid gap-7 py-4 grid-cols-1">
//       <div className="grid grid-cols-3 gap-4">
//         <div className="flex flex-col gap-2">
//           <label>First Name</label>
//           <Input
//             value={user?.firstname || ""}
//             onChange={(e) => setUser((prev) => ({ ...prev, firstname: e.target.value }))}
//             placeholder="Enter first name"
//             disabled={userRole === "Employee"}
//           />
//         </div>
//         <div className="flex flex-col gap-2">
//           <label>Last Name</label>
//           <Input
//             value={user?.lastname || ""}
//             onChange={(e) => setUser((prev) => ({ ...prev, lastname: e.target.value }))}
//             placeholder="Enter last name"
//             disabled={userRole === "Employee"}
//           />
//         </div>
//         <div className="flex flex-col gap-2">
//           <label>Middle Name</label>
//           <Input
//             value={user?.middlename || ""}
//             onChange={(e) => setUser((prev) => ({ ...prev, middlename: e.target.value }))}
//             placeholder="Enter middle name (optional)"
//             disabled={userRole === "Employee"}
//           />
//         </div>
//       </div>
//       {/* Add other fields similarly */}
//     </div>
//   );

//   return (
//     <div className="px-4 flex flex-col items-center">
//       <Toaster position="top-right" richColors />
//       <Header
//         userRole={userRole}
//         onAddClick={() => setModalState((prev) => ({ ...prev, isAddModalOpen: true }))}
//         searchTerm={tableState.searchTerm}
//         setSearchTerm={(value) => setTableState((prev) => ({ ...prev, searchTerm: value }))}
//         statusFilter=""
//         setStatusFilter={() => {}}
//       />
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       <GenericTable
//         items={paginatedUsers}
//         columns={columns}
//         loading={loading}
//         sortConfig={tableState.sortConfig}
//         onSort={handleSort}
//         onEdit={(user) => setFormState((prev) => ({ ...prev, selectedUser: user }))}
//         onDelete={(user) => {
//           setFormState((prev) => ({ ...prev, selectedUser: user }));
//           setModalState((prev) => ({ ...prev, isDeleteModalOpen: true }));
//         }}
//         onView={handleView}
//         userRole={userRole}
//         itemsPerPage={itemsPerPage}
//         caption="List of registered users"
//       />
//       <Pagination
//         currentPage={tableState.currentPage}
//         totalPages={totalPages}
//         setCurrentPage={(page) => setTableState((prev) => ({ ...prev, currentPage: page }))}
//       />
//       <GenericModal
//         isOpen={modalState.isAddModalOpen}
//         onOpenChange={(open) => setModalState((prev) => ({ ...prev, isAddModalOpen: open }))}
//         title="Add New User"
//         description="Enter the details for the new user."
//         item={formState.newUser}
//         onSave={() => handleAdd(formState.newUser!)}
//         onCancel={() => setModalState((prev) => ({ ...prev, isAddModalOpen: false }))}
//         isSaving={loadingState.isAdding}
//         renderForm={renderUserForm}
//       />
//       <GenericModal
//         isOpen={modalState.isEditModalOpen}
//         onOpenChange={(open) => setModalState((prev) => ({ ...prev, isEditModalOpen: open }))}
//         title="Edit User"
//         description="Update the user’s details."
//         item={formState.selectedUser}
//         onSave={() => handleUpdate(formState.selectedUser as User)}
//         onCancel={() => setModalState((prev) => ({ ...prev, isEditModalOpen: false }))}
//         isSaving={loadingState.isUpdating}
//         renderForm={renderUserForm}
//       />
//       {/* Delete modal remains specific for now */}
//     </div>
//   );
// };

// export default UserList;