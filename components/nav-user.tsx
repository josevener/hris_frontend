"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Redirect to login if no user is authenticated
  if (!loading && !user) {
    // router.push("/login");
    return null; // Render nothing while redirecting
  }

  const getInitials = (): string => {
    if (!user) return "U";
    const firstInitial = user.firstname?.charAt(0) || "";
    const lastInitial = user.lastname?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const getFullName = (): string => {
    if (!user) return "User";
    const middle = user.middlename ? ` ${user.middlename}` : "";
    const ext = user.extension ? ` ${user.extension}` : "";
    return `${user.firstname || ""}${middle} ${user.lastname || ""}${ext}`.trim();
  };

  const handleLogout = async () => {
    await logout(); // Use context logout
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleBilling = () => {
    router.push("/billing");
  };

  const handleNotifications = () => {
    router.push("/notifications");
  };

  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {loading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.profile_image || ""}
                      alt={getFullName()}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{getFullName()}</span>
                    <span className="truncate text-xs">{user?.email || "N/A"}</span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-1 py-1.5 text-left text-sm">
                {loading ? (
                  <>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.profile_image || ""}
                          alt={getFullName()}
                        />
                        <AvatarFallback className="rounded-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{getFullName()}</span>
                        <span className="truncate text-xs">{user?.email || "N/A"}</span>
                      </div>
                    </div>
                    <div className="grid text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Role: {user?.role_name || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        ID: {user?.company_id_number || "N/A"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleUpgrade}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfile}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBilling}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNotifications}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}