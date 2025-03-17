"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

// Hook to get the current route
function useCurrentRoute(path: string) {
  const pathname = usePathname();
  return pathname.startsWith(path);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: "JV Rafael",
      email: "jvrafael@gmail.com",
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Example_image.svg',
    },
    teams: [
      {
        name: "BFD Corp.",
        logo: GalleryVerticalEnd,
        plan: "HR Department",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: SquareTerminal,
        isActive: useCurrentRoute("/dashboard/admin") ? true : false,
        items: [
          {
            title: "Admin",
            url: "/dashboard/admin",
          },
          {
            title: "Employee",
            url: "#",
          },
          {
            title: "Guest",
            url: "#",
          },
        ],
      },
      {
        title: "User Management",
        url: "#",
        icon: Bot,
        isActive: useCurrentRoute("/users") ? true : false,
        items: [
          {
            title: "Users",
            url: "/users",
          },
          {
            title: "Activity Log",
            url: "#",
          },
        ],
      },
      {
        title: "Employee Management",
        url: "#",
        icon: BookOpen,
        isActive: useCurrentRoute("/employees") || useCurrentRoute("/salary") ? true : false,
        items: [
          {
            title: "Employees",
            url: "/employees",
          },
          {
            title: "Attendance",
            url: "#",
          },
          {
            title: "Leave",
            url: "#",
          },
          {
            title: "Salary",
            url: "/salary",
          },
        ],
      },
      {
        title: "Payroll Management",
        url: "#",
        icon: BookOpen,
        isActive: useCurrentRoute("/payroll") ? true : false,
        items: [
          {
            title: "Payroll",
            url: "/payroll",
          },
          {
            title: "Payroll Items",
            url: "/payroll/items",
          },
          {
            title: "Payslips",
            url: "/payroll/payslips",
          },
        ],
      },
     {
      title: "Settings",
      url: "#",
      icon: Settings2,
      isActive: useCurrentRoute("/settings"),
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Payroll Cycle",
          url: "/settings/payroll/cycle",
        },
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Security & Privacy",
          url: "/settings/security",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Appearance",
          url: "/settings/appearance",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
      ],
}

    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
