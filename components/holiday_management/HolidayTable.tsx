import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Holiday, UserRole, SortKey } from "@/types/department";
import { useMemo } from "react";
import HolidayActions from "./HolidayActions";
import { format } from "date-fns";

interface HolidayTableProps {
  holidays: Holiday[];
  loading: boolean;
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  handleSort: (key: SortKey) => void;
  handleViewProfile: (holiday: Holiday) => void;
  userRole: UserRole;
  itemsPerPage: number;
}

export const HolidayTable: React.FC<HolidayTableProps> = ({
  holidays,
  loading,
  sortConfig,
  handleSort,
  handleViewProfile,
  userRole,
  itemsPerPage,
}) => {
  const SortIcon = ({ column }: { column: SortKey }) =>
    sortConfig?.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 inline" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4 inline" />
      )
    ) : null;

  const renderKey = useMemo(() => Date.now(), []);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date_holiday in HolidayTable: ${dateString}`);
        return dateString; // Fallback to raw string
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error(`Error formatting date_holiday: ${dateString}`, error);
      return dateString;
    }
  };

  return (
    <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
      <TableCaption className="text-muted-foreground dark:text-gray-300">
        Comprehensive holiday management directory.
      </TableCaption>
      <TableHeader>
        <TableRow className="dark:bg-gray-700">
          <TableHead
            className="w-[50px] cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("id")}
          >
            ID <SortIcon column="id" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("name_holiday")}
          >
            Holiday Name <SortIcon column="name_holiday" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("date_holiday")}
          >
            Date <SortIcon column="date_holiday" />
          </TableHead>
          <TableHead
            className="cursor-pointer text-foreground dark:text-foreground"
            onClick={() => handleSort("type_holiday")}
          >
            Type <SortIcon column="type_holiday" />
          </TableHead>
          <TableHead className="w-[50px] text-center text-foreground dark:text-foreground">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <TableRow key={`skeleton-${renderKey}-${index}`} className="dark:bg-gray-800">
              <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20 dark:bg-gray-600" /></TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-8 w-20 mx-auto dark:bg-gray-600" />
              </TableCell>
            </TableRow>
          ))
        ) : holidays.length > 0 ? (
          holidays.map((holiday, index) => (
            <TableRow
              key={holiday.id}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <TableCell className="text-foreground dark:text-foreground">{index + 1}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{holiday.name_holiday}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{formatDate(holiday.date_holiday)}</TableCell>
              <TableCell className="text-foreground dark:text-foreground">{holiday.type_holiday}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <HolidayActions
                    holiday={holiday}
                    onView={handleViewProfile}
                    userRole={userRole}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow key="no-holidays" className="dark:bg-gray-800">
            <TableCell colSpan={5} className="text-center text-muted-foreground dark:text-gray-300">
              No holidays found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};