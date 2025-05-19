"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookIcon,
  Command,
  DollarSign,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  Users2,
  UserSquare,
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
import { User, Team, NavItem } from "@/types/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const data = React.useMemo<{
    user: User;
    teams: Team[];
    navMain: NavItem[];
  }>(
    () => ({
      user: {
        name: "JV Rafael",
        email: "jvrafael@gmail.com",
        avatar: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Example_image.svg",
      },
      teams: [
        { name: "BFD Corp.", logo: GalleryVerticalEnd, plan: "HR Department" },
        { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
        { name: "Evil Corp.", logo: Command, plan: "Free" },
      ],
      navMain: [
        { title: "Dashboard", url: "/dashboard", icon: SquareTerminal },
        {
          title: "User Management",
          url: "/users",
          icon: UserSquare,
          items: [
            { title: "Users", url: "/users" },
            { title: "Activity Log", url: "/users/activity-log" },
          ],
        },
        {
          title: "Teams",
          url: "/employees",
          icon: Users2,
          items: [
            { title: "Employees", url: "/employees" },
            { title: "Attendance", url: "/employees/attendance" },
            { title: "Leave", url: "/employees/leave" },
            { title: "Salary", url: "/salary" },
            { title: "Shift & Schedule", url: "/employees/shift-schedule" },
            { title: "Departments", url: "/employees/departments" },
            { title: "Designations (Positions)", url: "/employees/designations" },
            { title: "Holidays", url: "/holidays" },
          ],
        },
        {
          title: "Hire",
          url: "/hire",
          icon: BookIcon,
          items: [
            { title: "Hiring", url: "/hiring" },
            { title: "Onboarding", url: "/onboarding" },
            { title: "Hiring Handbook", url: "/hiring-handbook" },
          ],
        },
        {
          title: "Finance",
          url: "/payroll",
          icon: DollarSign,
          items: [
            { title: "Payroll", url: "/payroll" },
            { title: "Payroll Items", url: "/payroll/items" },
            { title: "Payslips", url: "/payroll/payslips" },
          ],
        },
        {
          title: "Settings & Configuration",
          url: "/settings",
          icon: Settings2,
          items: [
            { title: "General", url: "/settings/general" },
            { title: "Payroll Configuration", url: "/settings/payroll/configuration" },
            { title: "Account", url: "/settings/account" },
            { title: "Security & Privacy", url: "/settings/security" },
            { title: "Notifications", url: "/settings/notifications" },
            { title: "Appearance", url: "/settings/appearance" },
            { title: "Integrations", url: "/settings/integrations" },
          ],
        },
      ],
    }),
    []
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} defaultOpen={true} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}