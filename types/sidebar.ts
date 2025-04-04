import { LucideIcon } from "lucide-react";

export interface SubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon; // Use LucideIcon for consistency
  items?: SubItem[];
}

export interface Team {
  name: string;
  logo: LucideIcon; // LucideIcon for logos too
  plan: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}
