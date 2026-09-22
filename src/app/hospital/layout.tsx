import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getHospitalSidebarContext } from "@/servers/hospital";

export default async function HospitalSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const organizationId = session?.user?.id
    ? await getActiveOrganizationId(session.user.id).catch(() => undefined)
    : undefined;

  const context = organizationId
    ? await getHospitalSidebarContext(organizationId).catch(() => undefined)
    : undefined;

  return (
    <SidebarLayout
      role="hospital"
      userName={session?.user?.name ?? undefined}
      organizationId={organizationId}
      hospitalName={context?.hospitalName}
      hospitalLocation={context?.hospitalLocation}
      bloodBankStatus={context?.bloodBankStatus}
      bloodBankMessage={context?.bloodBankMessage}
      hospitalUserId={session?.user?.id}
    >
      {children}
    </SidebarLayout>
  );
}