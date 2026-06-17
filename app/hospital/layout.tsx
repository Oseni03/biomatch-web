import { SidebarLayout } from "@/components/layout/sidebar";

export default function HospitalSectionLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="hospital">{children}</SidebarLayout>;
}
