import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/employee";
import UserActions from "./UserActions";
import { ChevronUp, ChevronDown } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";

interface UserTableProps {
  users: User[];
  loading: boolean;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleViewProfile: (user: User) => void;
  sortConfig: { key: keyof User; direction: "asc" | "desc" } | null;
  handleSort: (key: keyof User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  handleViewProfile,
  sortConfig,
  handleSort,
}) => {
  const getFullName = (user: User): string => {
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  // Format date as "March 31, 2025"
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
          {/* <TableHead className="w-[50px] cursor-pointer dark:text-gray-200" onClick={() => handleSort("id")}>
            ID <SortIcon column="id" />
          </TableHead> */}
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("lastname")}>
            Name <SortIcon column="lastname" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("email")}>
            Email <SortIcon column="email" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("phone_number")}>
            Mobile No. <SortIcon column="phone_number" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("role_name")}>
            Role <SortIcon column="role_name" />
          </TableHead>
          <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("created_at")}>
            Joined Date <SortIcon column="created_at" />
          </TableHead>
          {/* <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("is_active")}>
            Status <SortIcon column="is_active" />
          </TableHead> */}
          <TableHead className="text-center dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
              {/* <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell> */}
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              {/* <TableCell><Skeleton className="h-4 w-12 dark:bg-gray-600" /></TableCell> */}
              <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" /></TableCell>
            </TableRow>
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
              {/* <TableCell className="dark:text-gray-200">{index + 1}</TableCell> */}
              <TableCell className="dark:text-gray-200">
                {getFullName(user)}{" "}
                {differenceInHours(new Date(), parseISO(user.created_at)) <= 1 && (
                  <span className="ml-2 animate-pulse bg-green-600 rounded-md text-white text-xs px-1">
                    New
                  </span>
                )}
              </TableCell>
              <TableCell className="dark:text-gray-200">{user.email}</TableCell>
              <TableCell className="dark:text-gray-200">{user.phone_number ? user.phone_number : "N/A"}</TableCell>
              <TableCell className="dark:text-gray-200">{user.role_name}</TableCell>
              <TableCell className="dark:text-gray-200">{formatDate(user.created_at)}</TableCell>
              {/* <TableCell className="dark:text-gray-200">
              <Badge variant={user.is_active ? "outline-success" : "outline-destructive"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
              </TableCell> */}
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <UserActions
                    user={user}
                    onView={handleViewProfile} // Only View button
                  />
                </div>
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