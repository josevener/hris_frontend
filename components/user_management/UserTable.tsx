import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { User, UserRole } from "@/types/employee";
import UserActions from "./UserActions";
import { ChevronUp, ChevronDown } from "lucide-react";

interface UserTableProps {
  users: User[];
  loading: boolean;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleViewProfile: (user: User) => void;
  userRole: UserRole;
  sortConfig: { key: keyof User; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  handleEdit,
  handleDelete,
  handleViewProfile,
  userRole,
  sortConfig,
  handleSort,
}) => {
  const getFullName = (user: User): string => {
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const SortIcon = ({ column }: { column: keyof User }) =>
    sortConfig?.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 inline" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4 inline" />
      )
    ) : null;

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead className="w-[50px] cursor-pointer dark:text-gray-200" onClick={() => handleSort("id")}>
            ID <SortIcon column="id" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("lastname")}>
            Name <SortIcon column="lastname" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("email")}>
            Email <SortIcon column="email" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("role_name")}>
            Role <SortIcon column="role_name" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("created_at")}>
            Joined Date <SortIcon column="created_at" />
          </TableHead>
          <TableHead className="w-[150px] text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              <TableCell className="dark:text-gray-200">{user.id}</TableCell>
              <TableCell className="dark:text-gray-200">{getFullName(user)}</TableCell>
              <TableCell className="dark:text-gray-200">{user.email}</TableCell>
              <TableCell className="dark:text-gray-200">{user.role_name}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-center">
                <UserActions
                  user={user}
                  userRole={userRole}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewProfile={handleViewProfile}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:bg-gray-800">
            <TableCell colSpan={6} className="text-center dark:text-gray-300">
              No users available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;