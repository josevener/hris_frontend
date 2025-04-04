import { useState, useEffect } from "react";
import {
  createAttendance,
  fetchAttendances,
  updateAttendance,
} from "@/services/api/apiAttendance";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { Attendance } from "@/types/attendance";
import { Employee } from "@/types/salary";
import { toast } from "sonner";
import { getCookie } from "@/lib/auth";

export const useAttendanceData = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = await getCookie("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        toast.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [attendanceData, employeeData] = await Promise.all([
          fetchAttendances(),
          fetchEmployees(token),
        ]);

        console.log("Fetched attendances:", attendanceData);
        console.log("Fetched employees:", employeeData);

        const validAttendanceData = Array.isArray(attendanceData)
          ? attendanceData
          : [];

        const enrichedAttendances = validAttendanceData.map((attendance) => ({
          ...attendance,
          employee: employeeData.find(
            (emp) => emp.id === attendance.employee_id
          ),
        }));

        setAttendances(enrichedAttendances);
        setEmployees(employeeData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
        toast.error(err.message || "Failed to fetch data.");
        console.error("Error fetching data:", err);
        setAttendances([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Empty dependency array means this runs once on mount

  const addAttendance = async (attendance: Partial<Attendance>) => {
    const token = await getCookie("token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      throw new Error("No token found");
    }

    try {
      const newAttendance = await createAttendance(attendance);
      const updatedAttendances = await fetchAttendances();
      const employeeData = await fetchEmployees(token);
      const validUpdatedAttendances = Array.isArray(updatedAttendances)
        ? updatedAttendances
        : [];
      const enrichedAttendances = validUpdatedAttendances.map((att) => ({
        ...att,
        employee: employeeData.find((emp) => emp.id === att.employee_id),
      }));
      setAttendances(enrichedAttendances);
      setEmployees(employeeData);
      return newAttendance;
    } catch (err: any) {
      setError(err.message || "Failed to add attendance.");
      toast.error(err.message || "Failed to add attendance.");
      console.error("Error adding attendance:", err);
      throw err;
    }
  };

  const editAttendance = async (
    id: number,
    attendance: Partial<Attendance>
  ) => {
    const token = await getCookie("token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      throw new Error("No token found");
    }

    try {
      await updateAttendance(id, attendance);
      const updatedAttendances = await fetchAttendances();
      const employeeData = await fetchEmployees(token);
      const validUpdatedAttendances = Array.isArray(updatedAttendances)
        ? updatedAttendances
        : [];
      const enrichedAttendances = validUpdatedAttendances.map((att) => ({
        ...att,
        employee: employeeData.find((emp) => emp.id === att.employee_id),
      }));
      setAttendances(enrichedAttendances);
      setEmployees(employeeData);
    } catch (err: any) {
      setError(err.message || "Failed to edit attendance.");
      toast.error(err.message || "Failed to edit attendance.");
      console.error("Error editing attendance:", err);
      throw err;
    }
  };

  return {
    attendances,
    employees,
    loading,
    error,
    setAttendances,
    addAttendance,
    editAttendance,
  };
};
