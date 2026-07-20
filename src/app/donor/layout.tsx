import { SidebarLayout } from "@/components/layout/sidebar";
import { getServerSession } from "@/lib/get-session";

export default async function DonorSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <SidebarLayout role="donor" userName={session?.user?.name ?? undefined}>
      {children}
    </SidebarLayout>
  );
}
