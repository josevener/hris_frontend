"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster, toast } from "sonner";
import { Clock, Calendar, Plane, AlertCircle } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { format, parseISO } from "date-fns";
import { getCookie } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types/employee";

const TimeClock: React.FC = () => {
  const { attendances, employees, clockIn, clockOut, calculateTotalHoursInPeriod } = useAttendanceData();
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("Fetching location...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [employeeName, setEmployeeName] = useState<string>("Employee");
  const [runningTotalTime, setRunningTotalTime] = useState<string>("00:00:00");

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      const userCookie = await getCookie("user");
      if (userCookie) {
        try {
          const user: User = JSON.parse(userCookie);
          setEmployeeName(user.firstname);

          const matchedEmployee = employees.find(
            (emp) => emp.user_id === user.id && emp.company_id_number === user.company_id_number
          );
          if (matchedEmployee) {
            setEmployeeId(matchedEmployee.id);
          } else {
            setErrorMessage("No matching employee found for the logged-in user.");
          }
        } catch (err) {
          console.error("Failed to parse user cookie:", err);
          setErrorMessage("Failed to load user information.");
        }
      } else {
        setErrorMessage("User not authenticated. Please log in.");
        router.push("/login");
      }

      if (navigator.geolocation) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=14.6760&lon=121.0437&zoom=18&addressdetails=1`,
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
            setCurrentLocation(formattedAddress || "Unknown location");
          } else {
            setCurrentLocation("Unknown location");
          }
        } catch (error) {
          setCurrentLocation("Location unavailable");
          toast.error("Failed to fetch address");
          console.error("Error fetching address:", error);
        }
      } else {
        setCurrentLocation("Location not supported");
        toast.error("Geolocation is not supported by this browser.");
      }

      setIsMounted(true);
      setCurrentTime(new Date());
    };

    fetchUserAndLocation();
  }, [employees, router]);

  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isMounted]);

  // Calculate and update the running total time
  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendances.find(
    (att) => att.employee_id === employeeId && att.date === today
  );

  const lastClockIn = attendances
    .filter((att) => att.employee_id === employeeId && att.clock_in)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const periodStart = format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd");
  const periodEnd = today;
  const totalHours = calculateTotalHoursInPeriod(employeeId, periodStart, periodEnd);

  useEffect(() => {
    if (!isMounted) return;

    const updateRunningTime = () => {
      let totalSeconds = totalHours * 3600; // Convert total hours to seconds

      // If currently clocked in, add the elapsed time since clock-in
      if (todayAttendance && todayAttendance.clock_in && !todayAttendance.clock_out) {
        const clockInTime = parseISO(`${todayAttendance.date}T${todayAttendance.clock_in}`);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - clockInTime.getTime()) / 1000);
        totalSeconds += elapsedSeconds;
      }

      // Format as HH:mm:ss
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setRunningTotalTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateRunningTime(); // Initial update
    const interval = setInterval(updateRunningTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isMounted, totalHours, todayAttendance]);

  const canClockIn = !todayAttendance && employeeId !== 0;
  const canClockOut = !!todayAttendance && !todayAttendance.clock_out;

  const handleClockIn = async () => {
    if (employeeId === 0) {
      setErrorMessage("Cannot clock in: Invalid employee ID. Please ensure employee data is loaded.");
      return;
    }

    try {
      setErrorMessage(null);
      await clockIn(employeeId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === "Already clocked in and out today") {
        setErrorMessage("You have already clocked in and out today. Only one attendance record per day is allowed.");
      } else if (err.message === "Already clocked in") {
        setErrorMessage("You have already clocked in today. Please clock out first.");
      } else {
        setErrorMessage(err.message || "Failed to clock in.");
      }
      console.error("Clock in error:", err);
    }
  };

  const handleClockOut = () => {
    if (!todayAttendance) return;
    setShowClockOutConfirm(true);
    setErrorMessage(null);
  };

  const confirmClockOut = async () => {
    if (!todayAttendance) return;

    try {
      await clockOut(todayAttendance.id);
      setShowClockOutConfirm(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to clock out.");
      setShowClockOutConfirm(false);
      console.error("Clock out error:", err);
    }
  };

  const cancelClockOut = () => {
    setShowClockOutConfirm(false);
  };

  if (!isMounted) {
    return (
      <Card className="w-full max-w-5xl p-4 shadow-lg bg-white dark:bg-gray-800 rounded-lg">
        <div className="md:grid md:grid-cols-2 md:gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Loading location...</p>
            <div className="my-3 md:my-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-r from-blue-400 to-blue-600 shadow-md">
                <AvatarFallback className="text-xl md:text-2xl font-bold text-white">
                  {employeeName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Hello, {employeeName}
            </h1>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2 md:mt-3">
              --:--:-- --
            </p>
          </div>
          <div className="text-center mt-4 md:mt-0">
            {lastClockIn && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Clocked in at {lastClockIn.clock_in} on {format(parseISO(lastClockIn.date), "MM-dd-yyyy")}
              </p>
            )}
            <Card className="mt-2 md:mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Hours this period</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {totalHours.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-3 mt-3 md:mt-4">
              <Button
                disabled
                className="h-16 md:h-20 text-sm md:text-base font-semibold flex flex-col items-center justify-center gap-1 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed rounded-lg shadow-sm"
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                Clock In
              </Button>
              <Button
                disabled
                className="h-16 md:h-20 text-sm md:text-base font-semibold flex flex-col items-center justify-center gap-1 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed rounded-lg shadow-sm"
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                Clock Out
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-5xl p-4 shadow-lg bg-white dark:bg-gray-800 rounded-lg">
        <div className="md:grid md:grid-cols-2 md:gap-4">
          {/* Main Content (Left Column on Web) */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {todayAttendance?.clock_in_location
                ? `Clocked in at: ${todayAttendance.clock_in_location}`
                : todayAttendance?.clock_out_location
                ? `Clocked out at: ${todayAttendance.clock_out_location}`
                : currentLocation}
            </p>
            <div className="my-3 md:my-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-r from-blue-400 to-blue-600 shadow-md">
                <AvatarFallback className="text-xl md:text-2xl font-bold text-white">
                  {employeeName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Hello, {employeeName}
            </h1>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2 md:mt-3 tracking-tight">
              {currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || "--:--:-- --"}
            </p>
          </div>

          {/* Sidebar Content (Right Column on Web, Below on Mobile) */}
          <div className="text-center mt-4 md:mt-0">
            {lastClockIn && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Clocked in at {lastClockIn.clock_in} on {format(parseISO(lastClockIn.date), "MM-dd-yyyy")}
              </p>
            )}
            <Card className="mt-2 md:mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Hours this period</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {runningTotalTime}
                </p>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-3 mt-3 md:mt-4">
              <Button
                onClick={handleClockIn}
                disabled={!canClockIn}
                className={`h-16 md:h-20 text-sm md:text-base font-semibold flex flex-col items-center justify-center gap-1 rounded-lg shadow-sm transition-all duration-300 ${
                  canClockIn
                    ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transform hover:scale-105 active:scale-95"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                Clock In
              </Button>
              <Button
                onClick={handleClockOut}
                disabled={!canClockOut}
                className={`h-16 md:h-20 text-sm md:text-base font-semibold flex flex-col items-center justify-center gap-1 rounded-lg shadow-sm transition-all duration-300 ${
                  canClockOut
                    ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transform hover:scale-105 active:scale-95"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                Clock Out
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message (Full Width) */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <Card className="bg-red-50 dark:bg-red-900 border-red-500 rounded-lg shadow-sm">
                <CardContent className="p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-300" />
                  <p className="text-xs text-red-700 dark:text-red-300">{errorMessage}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Confirmation Dialog for Clock Out */}
      <AnimatePresence>
        {showClockOutConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <Card className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Clock Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Are you sure you want to clock out?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={cancelClockOut}
                    variant="outline"
                    className="text-sm text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmClockOut}
                    className="text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg"
                  >
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-3">
        <div className="container mx-auto flex justify-around max-w-md">
          <Button
            variant="ghost"
            className="flex flex-col items-center text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
            onClick={() => router.push("/attendance/time-clock")}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs mt-1">Time Clock</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            onClick={() => router.push("/attendance/time-and-hours")}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Time and Hours</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            onClick={() => router.push("/time-off-center")}
          >
            <Plane className="h-5 w-5" />
            <span className="text-xs mt-1">Time Off Center</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default TimeClock;