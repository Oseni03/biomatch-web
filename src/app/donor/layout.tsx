import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export default async function DonorSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const donorId = session?.user?.id;
  const unreadCount = donorId
    ? await prisma.emergencyAlert.count({
        where: { donorId, openedAt: null },
      })
    : 0;
  return (
    <SidebarLayout
      role="donor"
      userName={session?.user?.name ?? undefined}
      hasUnreadNotifications={unreadCount > 0}
    >
      {children}
    </SidebarLayout>
  );
}
