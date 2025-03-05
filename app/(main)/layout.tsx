import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UserAvatar from "@/components/UseAvatar";

export const metadata: Metadata = {
  title: "BFD Corp.",
  description: "BFD Human Resource Information System",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            {/* Sidebar stays outside the main content */}
            <AppSidebar />

            {/* Wrapper to align header + main content */}
            <div className="flex flex-col flex-1" suppressHydrationWarning>
              {/* Header (stays outside main) */}
              <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <SidebarTrigger />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                {/* Move ModeToggle to the right */}
                <div className="flex flex-row ml-auto gap-3">
                  <ModeToggle />
                  <UserAvatar />
                </div>
              </header>

              {/* Main content (Children always inside) */}
              <main className="max-w-full flex-1 p-4 overflow-x-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
      </ThemeProvider>
  );
}
