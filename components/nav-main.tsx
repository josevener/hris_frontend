"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavItem, SubItem } from "@/types/sidebar";

interface NavMainProps {
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function NavMain({
  items,
  collapsible = true,
  defaultOpen = false,
}: NavMainProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = useCallback((title: string) => {
    setOpenItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasActiveSubItem = item.items?.some(
            (subItem) => pathname === subItem.url
          );
          const isActive = pathname === item.url && !hasActiveSubItem;
          const hasSubItems = !!item.items?.length;

          return collapsible && hasSubItems ? (
            <Collapsible
              key={item.title}
              open={openItems.includes(item.title) || (defaultOpen && (isActive || hasActiveSubItem))}
              onOpenChange={() => toggleItem(item.title)}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`w-full flex items-center justify-between text-foreground dark:text-foreground ${
                      isActive
                        ? "bg-gray-600 text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground"
                        : ""
                    }`}
                    aria-expanded={openItems.includes(item.title)}
                  >
                    <span className="flex items-center">
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openItems.includes(item.title) ? "rotate-90" : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem: SubItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              href={subItem.url}
                              className={`w-full text-foreground dark:text-foreground ${
                                isSubActive
                                  ? "bg-gray-300 text-primary dark:bg-primary-dark dark:text-primary-foreground"
                                  : ""
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={`w-full text-foreground dark:text-foreground ${
                  isActive
                    ? "bg-gray-600 text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground"
                    : ""
                }`}
              >
                <Link href={item.url} className="flex items-center">
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}