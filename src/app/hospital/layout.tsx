import { SidebarLayout } from "@/components/layout/sidebar";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";

export default async function HospitalSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const organizationId = session?.user?.id
    ? await getActiveOrganizationId(session.user.id).catch(() => undefined)
    : undefined;
  return (
    <SidebarLayout
      role="hospital"
      userName={session?.user?.name ?? undefined}
      organizationId={organizationId}
    >
      {children}
    </SidebarLayout>
  );
}
