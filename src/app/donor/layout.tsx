import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { LastKnownLocationUpdater } from "@/components/donor/last-known-location-updater";
import { getServerSession } from "@/lib/get-session";

export default async function DonorSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <SidebarLayout
      role="donor"
      userName={session?.user?.name ?? undefined}
      hasUnreadNotifications={false}
    >
      <LastKnownLocationUpdater />
      {children}
    </SidebarLayout>
  );
}
