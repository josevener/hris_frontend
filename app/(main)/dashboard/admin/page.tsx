"use client"; // Client-side component

import { useState, useMemo } from "react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from "recharts";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Star, 
  Bell 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { NumberTicker } from "@/components/magicui/number-ticker";

// Sample Data
const workforceData = { active: 180, onLeave: 10, resigned: 5 };
const pieChartData = [
  { name: "IT", value: 60 },
  { name: "HR", value: 30 },
  { name: "Finance", value: 50 },
  { name: "Sales", value: 40 },
];
const salaryBreakdownData = [
  { dept: "IT", salary: 150000 },
  { dept: "HR", salary: 80000 },
  { dept: "Finance", salary: 120000 },
  { dept: "Sales", salary: 100000 },
];
const attendanceData = { onTime: 150, late: 20, absent: 5, remote: 15 };
const employeeTableData = [
  { id: 1, name: "John Doe", dept: "IT", status: "Active", hireDate: "Jan 12, 2023" },
  { id: 2, name: "Jane Smith", dept: "HR", status: "On Leave", hireDate: "Feb 5, 2022" },
];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

export default function HRISAdminDashboard() {
  const [darkMode] = useState(false);
  const [deptFilter, setDeptFilter] = useState("All");
  const [notifications] = useState([
    { id: 1, msg: "New leave request from John Doe", time: "10 mins ago" },
  ]);

  const totalEmployees = useMemo(() => 
    workforceData.active + workforceData.onLeave + workforceData.resigned, 
    []
  );

  const filteredEmployees = useMemo(() => 
    deptFilter === "All" ? employeeTableData : employeeTableData.filter(e => e.dept === deptFilter), 
    [deptFilter]
  );

  return (
    <div className={`container mx-auto p-6 space-y-8 ${darkMode ? "dark" : ""}`} suppressHydrationWarning>
      {/* Header with Quick Actions & Theme Toggle */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">BFD Corp. Dashboard</h1>
          <p className="text-muted-foreground">Manage workforce, payroll, and compliance</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">Add Employee</Button>
          <Button variant="outline" size="sm">Approve Leave</Button>
          <Button variant="outline" size="sm">Process Payroll</Button>
          <ModeToggle />
          {/* <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" /> */}
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">{notifications.length}</Badge>
          )}
        </div>
      </header>

      {/* 1️⃣ Employee & Workforce Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Employee & Workforce Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Total Employees ({totalEmployees})</CardTitle></CardHeader>
            <CardContent className="flex gap-4">
              <Users className="h-8 w-8" />
              <div>
                <p>Active: {workforceData.active}</p>
                <p>On Leave: {workforceData.onLeave}</p>
                <p>Resigned: {workforceData.resigned}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                New Hires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <NumberTicker
                  value={55}
                  className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
                />
                <TrendingUp className="inline h-20 w-20 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Departures</CardTitle>
            </CardHeader>
            <CardContent> 
              <div className="flex items-center justify-between gap-2">
                <NumberTicker
                  value={25}
                  className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
                />
                <TrendingDown className="inline h-20 w-20 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl">
              <NumberTicker
                value={20}
                className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
              />
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader><CardTitle>Employee Distribution by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2️⃣ Attendance & Leave Management */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Attendance & Leave Management</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Today’s Attendance</CardTitle></CardHeader>
            <CardContent className="flex gap-4">
              <Clock className="h-8 w-8" />
              <div>
                <p>On-time: {attendanceData.onTime}</p>
                <p>Late: {attendanceData.late}</p>
                <p>Absent: {attendanceData.absent}</p>
                <p>Remote: {attendanceData.remote}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
            <CardContent>Pending: 4 | Approved: 10 | Denied: 2</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
              <CardContent>2 Holidays, 3 Birthdays</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overtime Requests</CardTitle>
            </CardHeader>
              <CardContent>Pending: 5 | Approved: 8</CardContent>
          </Card>
        </div>
      </section>

      {/* 3️⃣ Payroll & Salary Insights */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Payroll & Salary Insights</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Payroll</CardTitle>
            </CardHeader>
              <CardContent>
                <DollarSign className="inline h-4 w-4" />
                450,000
              </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Pending Payslips</CardTitle></CardHeader><CardContent>6</CardContent></Card>
          <Card><CardHeader><CardTitle>Deductions & Bonuses</CardTitle></CardHeader><CardContent>Ded: $5k | Bon: $10k</CardContent></Card>
          <Card className="lg:col-span-4">
            <CardHeader><CardTitle>Salary Breakdown by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart data={salaryBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dept" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="salary" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4️⃣ Performance & Productivity */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Performance & Productivity</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader><CardTitle>Top Performers</CardTitle></CardHeader><CardContent>Jane S. <Star className="inline h-4 w-4 text-yellow-500" /> 4.8</CardContent></Card>
          <Card><CardHeader><CardTitle>Training Progress</CardTitle></CardHeader><CardContent><BookOpen className="inline h-4 w-4" /> 85/100</CardContent></Card>
          <Card><CardHeader><CardTitle>Satisfaction Score</CardTitle></CardHeader><CardContent>4.2/5</CardContent></Card>
        </div>
      </section>

      {/* 5️⃣ HR Requests & Compliance */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">HR Requests & Compliance</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader><CardContent>Resignations: 2 | Transfers: 1</CardContent></Card>
          <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent>1 New Notice</CardContent></Card>
          <Card><CardHeader><CardTitle>Compliance Updates</CardTitle></CardHeader><CardContent>Tax Law Update</CardContent></Card>
          <Card><CardHeader><CardTitle>WFH Requests</CardTitle></CardHeader><CardContent>Pending: 3</CardContent></Card>
        </div>
      </section>

      {/* Employee Table with Filter */}
      <section>
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Employee Directory</CardTitle>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                {["All", "IT", "HR", "Finance", "Sales"].map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Hire Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.dept}</TableCell>
                    <TableCell>{emp.status}</TableCell>
                    <TableCell className="text-right">{emp.hireDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}