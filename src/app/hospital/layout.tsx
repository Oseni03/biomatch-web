import { SidebarLayout } from "@/components/layout/sidebar";
import { getServerSession } from "@/lib/get-session";

export default async function HospitalSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <SidebarLayout role="hospital" userName={session?.user?.name ?? undefined}>
      {children}
    </SidebarLayout>
  );
}
