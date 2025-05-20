import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Holiday } from "@/types/department";
import { fetchHolidays } from "@/services/api/apiHoliday";
import { useAuth } from "@/lib/AuthContext";

interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

interface UseHolidayData {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  setHolidays: Dispatch<SetStateAction<Holiday[]>>;
}

export const useHolidayData = (): UseHolidayData => {
  const { token } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const holidayResponse: PaginatedResponse<Holiday> = await fetchHolidays(
          token,
          1,
          100
        );
        console.log("Holiday API response:", holidayResponse); // Debug log
        if (!Array.isArray(holidayResponse.data)) {
          throw new Error("Invalid holiday data format");
        }
        setHolidays(holidayResponse.data.filter((h: Holiday) => !h.deleted_at));
      } catch (err: any) {
        const errorMessage =
          err.message || "Failed to load holiday data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching holiday data:", err);
        setHolidays([]); // Reset holidays to prevent further errors
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  return {
    holidays,
    loading,
    error,
    setHolidays,
  };
};
