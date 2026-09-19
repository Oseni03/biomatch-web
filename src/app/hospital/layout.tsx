import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { getServerSession } from "@/lib/get-session";

export default async function HospitalSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <SidebarLayout role="hospital" userName={session?.user?.name ?? undefined}>
      {children}
    </SidebarLayout>
  );
}