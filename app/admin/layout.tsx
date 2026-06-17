import { SidebarLayout } from "@/components/layout/sidebar";

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="admin">{children}</SidebarLayout>;
}
