// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";
// import { ThemeProvider } from "@/components/ui/theme-provider";
// import { ModeToggle } from "@/components/mode-toggle";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Avatar } from "@/components/ui/avatar";
// import UserAvatar from "@/components/UseAvatar";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "BFD",
//   description: "BFD Human Resource Information System",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen flex`}
//       >
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <SidebarProvider>
//             {/* Sidebar stays outside the main content */}
//             <AppSidebar />

//             {/* Wrapper to align header + main content */}
//             <div className="flex flex-col flex-1">
//               {/* Header (stays outside main) */}
//               <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//                 <SidebarTrigger />
//                 <Breadcrumb>
//                   <BreadcrumbList>
//                     <BreadcrumbItem className="hidden md:block">
//                       <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
//                     </BreadcrumbItem>
//                     <BreadcrumbSeparator className="hidden md:block" />
//                     <BreadcrumbItem>
//                       <BreadcrumbPage>Data Fetching</BreadcrumbPage>
//                     </BreadcrumbItem>
//                   </BreadcrumbList>
//                 </Breadcrumb>

//                 {/* Move ModeToggle to the right */}
//                 <div className="flex flex-row ml-auto gap-3">
//                   <ModeToggle />
//                   <UserAvatar />
//                 </div>
//               </header>

//               {/* Main content (Children always inside) */}
//               <main className="max-w-full flex-1 p-4 overflow-x-auto">
//                 {children}
//               </main>
//             </div>
//           </SidebarProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
