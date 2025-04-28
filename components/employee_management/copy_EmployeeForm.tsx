// import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Loader2, Edit as EditIcon } from "lucide-react";
// import { Department, Designation, Employee, User, UserRole } from "@/types/employee";

// interface EmployeeFormProps {
//   employee: Partial<Employee>;
//   users: User[];
//   departments: Department[];
//   designations: Designation[];
//   onChange: (updatedEmployee: Partial<Employee>) => void;
//   onSave: () => void;
//   onCancel: () => void;
//   isSaving: boolean;
//   userRole: UserRole;
//   isEditMode?: boolean;
//   isEditable?: boolean; // Optional for add mode
//   setIsEditable?: (value: boolean) => void; // Optional for add mode
// }

// const EmployeeForm: React.FC<EmployeeFormProps> = ({
//   employee,
//   users,
//   departments,
//   designations,
//   onChange,
//   onSave,
//   onCancel,
//   isSaving,
//   userRole,
//   isEditMode = false,
//   isEditable = false, // Default to false if not provided
//   setIsEditable,
// }) => {
//   const getFullName = (emp: Employee) =>
//     emp.user
//       ? `${emp.user.firstname} ${emp.user.middlename ? emp.user.middlename[0] + "." : ""} ${emp.user.lastname}`.trim()
//       : "N/A";

//   const getUserCompanyId = (userId: number) => {
//     const user = users.find((u) => u.id === userId);
//     return user ? user.company_id_number : "";
//   };

//   const handleEditClick = () => {
//     if (setIsEditable) {
//       setIsEditable(true);
//     }
//   };

//   return (
//     <SheetContent side="bottom" className="w-full bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700 rounded-t-lg">
//       <SheetHeader>
//         <SheetTitle className="text-foreground dark:text-foreground">
//           {isEditMode ? "View/Edit Employee" : "Add New Employee"}
//         </SheetTitle>
//         <SheetDescription className="text-muted-foreground dark:text-gray-300">
//           {isEditMode ? "View or update the employee’s details." : "Enter the details for the new employee."}
//         </SheetDescription>
//       </SheetHeader>

//       {/* Static Tabs */}
//       <Tabs defaultValue="personal" className="w-full">
//         <TabsList className="grid w-full grid-cols-3 border-b dark:border-gray-700">
//           <TabsTrigger value="personal" className="dark:text-foreground dark:hover:bg-gray-700">Personal</TabsTrigger>
//           <TabsTrigger value="employment" className="dark:text-foreground dark:hover:bg-gray-700">Employment</TabsTrigger>
//           <TabsTrigger value="documents" className="dark:text-foreground dark:hover:bg-gray-700">Documents</TabsTrigger>
//         </TabsList>
//       </Tabs>

//       {/* Form Content */}
//       <div className="grid gap-4 py-4 grid-cols-6">
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="user_id" className="text-foreground dark:text-foreground">Employee Name *</Label>
//           {isEditMode ? (
//             <Input
//               id="edit-user_id"
//               value={getFullName(employee as Employee)}
//               disabled
//               className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
//             />
//           ) : (
//             <Select
//               value={employee.user_id?.toString() || ""}
//               onValueChange={(value) => onChange({ ...employee, user_id: parseInt(value) || 0 })}
//             >
//               <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//                 <SelectValue placeholder="Select Employee" />
//               </SelectTrigger>
//               <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//                 {users.map((user) => (
//                   <SelectItem key={user.id} value={user.id.toString()}>
//                     {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           )}
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="company_id_number" className="text-foreground dark:text-foreground">Employee ID</Label>
//           <Input
//             id="company_id_number"
//             value={isEditMode ? employee.company_id_number || "" : employee.user_id ? getUserCompanyId(employee.user_id) : ""}
//             disabled
//             className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
//           />
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="birthdate" className="text-foreground dark:text-foreground">Birthdate</Label>
//           <Input
//             id="birthdate"
//             type="date"
//             value={employee.birthdate || ""}
//             onChange={(e) => onChange({ ...employee, birthdate: e.target.value || null })}
//             disabled={(!isEditable && isEditMode) || userRole === "Employee"}
//             className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600"
//           />
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="supervisor" className="text-foreground dark:text-foreground">Supervisor</Label>
//           <Select
//             value={employee.reports_to || "none"}
//             onValueChange={(value) => onChange({ ...employee, reports_to: value === "none" ? null : value })}
//             disabled={(!isEditable && isEditMode) || userRole === "Employee"}
//           >
//             <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectValue placeholder="Select Supervisor" />
//             </SelectTrigger>
//             <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectItem value="none">None</SelectItem>
//               {users
//                 .filter((user) => user.id !== employee.user_id)
//                 .map((user) => (
//                   <SelectItem key={user.id} value={user.id.toString()}>
//                     {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
//                   </SelectItem>
//                 ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="gender" className="text-foreground dark:text-foreground">Gender</Label>
//           <Select
//             value={employee.gender || "none"}
//             onValueChange={(value) => onChange({ ...employee, gender: value === "none" ? null : value })}
//             disabled={(!isEditable && isEditMode) || userRole === "Employee"}
//           >
//             <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectValue placeholder="Select Gender" />
//             </SelectTrigger>
//             <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectItem value="none">None</SelectItem>
//               <SelectItem value="Male">Male</SelectItem>
//               <SelectItem value="Female">Female</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="department_id" className="text-foreground dark:text-foreground">Department *</Label>
//           <Select
//             value={employee.department_id?.toString() || ""}
//             onValueChange={(value) => onChange({ ...employee, department_id: parseInt(value) || 0, designation_id: 0 })}
//             disabled={(!isEditable && isEditMode) || userRole === "Employee"}
//           >
//             <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectValue placeholder="Select Department" />
//             </SelectTrigger>
//             <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               {departments.map((dept) => (
//                 <SelectItem key={dept.id} value={dept.id.toString()}>
//                   {dept.department}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="col-span-2 flex flex-col gap-2">
//           <Label htmlFor="designation_id" className="text-foreground dark:text-foreground">Designation *</Label>
//           <Select
//             value={employee.designation_id?.toString() || ""}
//             onValueChange={(value) => onChange({ ...employee, designation_id: parseInt(value) || 0 })}
//             disabled={(!employee.department_id || (!isEditable && isEditMode)) || userRole === "Employee"}
//           >
//             <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               <SelectValue placeholder="Select Designation" />
//             </SelectTrigger>
//             <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
//               {designations
//                 .filter((desig) => desig.department_id === employee.department_id)
//                 .map((desig) => (
//                   <SelectItem key={desig.id} value={desig.id.toString()}>
//                     {desig.designation}
//                   </SelectItem>
//                 ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//       <SheetFooter className="flex justify-between gap-2">
//         {isEditMode && !isEditable && (
//           <Button
//             onClick={handleEditClick}
//             className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
//           >
//             <EditIcon className="h-4 w-4" /> Edit
//           </Button>
//         )}
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={onCancel}
//             className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
//           >
//             Cancel
//           </Button>
//           {(isEditMode ? isEditable : true) && (
//             <Button
//               onClick={onSave}
//               disabled={isSaving}
//               className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
//             >
//               {isSaving ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
//                 </>
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           )}
//         </div>
//       </SheetFooter>
//     </SheetContent>
//   );
// };

// export default EmployeeForm;