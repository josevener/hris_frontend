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
      const token = await getCookie("auth_token");
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
  }, []);

  const calculateWorkedHours = (clockIn: string, clockOut: string): number => {
    const [inHours, inMinutes, inSeconds] = clockIn.split(":").map(Number);
    const [outHours, outMinutes, outSeconds] = clockOut.split(":").map(Number);

    const inTime = new Date();
    inTime.setHours(inHours, inMinutes, inSeconds);
    const outTime = new Date();
    outTime.setHours(outHours, outMinutes, outSeconds);

    const diffMs = outTime.getTime() - inTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
    return Number(diffHours.toFixed(2));
  };

  const calculateTotalHoursInPeriod = (
    employeeId: number,
    periodStart: string,
    periodEnd: string
  ): number => {
    const periodAttendances = attendances.filter(
      (att) =>
        att.employee_id === employeeId &&
        att.date >= periodStart &&
        att.date <= periodEnd &&
        att.worked_hours !== null &&
        att.worked_hours !== undefined
    );

    const totalHours = periodAttendances.reduce((sum, att) => {
      const hours = Number(att.worked_hours) || 0;
      return sum + hours;
    }, 0);

    return totalHours;
  };

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "YourAppName/1.0 (your.email@example.com)",
                },
              }
            );
            const data = await response.json();
            if (data && data.display_name) {
              const addressParts = [];
              if (data.address.road) addressParts.push(data.address.road);
              if (data.address.suburb) addressParts.push(data.address.suburb);
              if (data.address.city) addressParts.push(data.address.city);
              const formattedAddress = addressParts.join(", ");
              resolve(formattedAddress || "Unknown location");
            } else {
              resolve("Unknown location");
            }
          } catch (error) {
            reject(
              new Error(
                "Failed to fetch address: " +
                  (error instanceof Error ? error.message : "Unknown error")
              )
            );
          }
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        }
      );
    });
  };

  const clockIn = async (employeeId: number) => {
    const token = await getCookie("auth_token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      throw new Error("No token found");
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const existingAttendance = attendances.find(
        (att) => att.employee_id === employeeId && att.date === today
      );

      if (existingAttendance) {
        if (existingAttendance.clock_out) {
          throw new Error("Already clocked in and out today");
        } else {
          throw new Error("Already clocked in");
        }
      }

      const now = new Date();
      const clockInTime = now.toTimeString().split(" ")[0];
      let clockInLocation: string | undefined;

      try {
        clockInLocation = await getCurrentLocation();
      } catch (locationError: any) {
        toast.error(locationError.message);
        throw locationError;
      }

      const newAttendance: Partial<Attendance> = {
        employee_id: employeeId,
        date: today,
        clock_in: clockInTime,
        clock_in_location: clockInLocation,
      };

      const createdAttendance = await createAttendance(newAttendance);
      const updatedAttendances = await fetchAttendances();
      const employeeData = await fetchEmployees(token);
      const validUpdatedAttendances = Array.isArray(updatedAttendances)
        ? updatedAttendances
        : [];
      const enrichedAttendances = validUpdatedAttendances.map((attendance) => ({
        ...attendance,
        employee: employeeData.find((emp) => emp.id === attendance.employee_id),
      }));
      setAttendances(enrichedAttendances);
      setEmployees(employeeData);
      toast.success("Successfully clocked in!");
      return createdAttendance;
    } catch (err: any) {
      if (err.message === "Already clocked in and out today") {
        throw err;
      } else if (err.message === "Already clocked in") {
        throw err;
      } else if (err.message.includes("Validation failed")) {
        try {
          const errorResponse = JSON.parse(
            err.message.split("Validation failed: ")[1] || "{}"
          );
          const errorMessages = errorResponse.errors || {};
          const detailedErrors = Object.values(errorMessages).flat().join(", ");
          setError(
            detailedErrors || "Failed to clock in due to validation errors."
          );
          toast.error(
            detailedErrors || "Failed to clock in due to validation errors."
          );
        } catch (parseErr) {
          setError("Failed to clock in: Validation failed.");
          toast.error("Failed to clock in: Validation failed.");
        }
      } else {
        setError(err.message || "Failed to clock in.");
        toast.error(err.message || "Failed to clock in.");
      }
      console.error("Error clocking in:", err);
      throw err;
    }
  };

  const clockOut = async (attendanceId: number) => {
    const token = await getCookie("auth_token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      toast.error("User not authenticated. Please log in.");
      throw new Error("No token found");
    }

    try {
      const attendance = attendances.find((att) => att.id === attendanceId);
      if (!attendance || !attendance.clock_in) {
        toast.error("No clock-in record found to clock out.");
        throw new Error("No clock-in record found");
      }
      if (attendance.clock_out) {
        toast.error("You have already clocked out for this record.");
        throw new Error("Already clocked out");
      }

      const now = new Date();
      const clockOutTime = now.toTimeString().split(" ")[0];
      let clockOutLocation: string | undefined;

      try {
        clockOutLocation = await getCurrentLocation();
      } catch (locationError: any) {
        toast.error(locationError.message);
        throw locationError;
      }

      const updatedAttendance: Partial<Attendance> = {
        ...attendance,
        clock_out: clockOutTime,
        clock_out_location: clockOutLocation,
        worked_hours: calculateWorkedHours(attendance.clock_in, clockOutTime),
      };

      await updateAttendance(attendanceId, updatedAttendance);
      const updatedAttendances = await fetchAttendances();
      const employeeData = await fetchEmployees(token);
      const validUpdatedAttendances = Array.isArray(updatedAttendances)
        ? updatedAttendances
        : [];
      const enrichedAttendances = validUpdatedAttendances.map((attendance) => ({
        ...attendance,
        employee: employeeData.find((emp) => emp.id === attendance.employee_id),
      }));
      setAttendances(enrichedAttendances);
      setEmployees(employeeData);
      toast.success("Successfully clocked out!");
    } catch (err: any) {
      setError(err.message || "Failed to clock out.");
      toast.error(err.message || "Failed to clock out.");
      console.error("Error clocking out:", err);
      throw err;
    }
  };

  const addAttendance = async (attendance: Partial<Attendance>) => {
    const token = await getCookie("auth_token");
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
      const enrichedAttendances = validUpdatedAttendances.map((attendance) => ({
        ...attendance,
        employee: employeeData.find((emp) => emp.id === attendance.employee_id),
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
    const token = await getCookie("auth_token");
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
      const enrichedAttendances = validUpdatedAttendances.map((attendance) => ({
        ...attendance,
        employee: employeeData.find((emp) => emp.id === attendance.employee_id),
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
    clockIn,
    clockOut,
    calculateTotalHoursInPeriod,
  };
};
