import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
  Network,
  FolderOpen
} from "lucide-react";

export const Icons = {
  Dashboard: LayoutDashboard,
  Users: Users,
  Student: GraduationCap,
  Alumni: Network,
  Job: Briefcase,
  Company: Building2,
  Calendar: Calendar,
  Report: FileText,
  Project: FolderOpen,
  Settings: Settings,
  Logout: LogOut,
  ChevronDown: ChevronDown,
};

export type IconKey = keyof typeof Icons;

export default function NavIcon({ name, className }: { name: IconKey; className?: string }) {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}
