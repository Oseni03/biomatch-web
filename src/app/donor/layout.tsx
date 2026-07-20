import { SidebarLayout } from "@/components/layout/sidebar";

export default function DonorSectionLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout role="donor">{children}</SidebarLayout>;
}
