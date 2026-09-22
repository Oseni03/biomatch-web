import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { requireAdmin } from "@/servers/admin";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	try {
		await requireAdmin(session.user.id);
	} catch {
		redirect("/donor");
	}
	return (
		<SidebarLayout role="admin" userName={session.user.name}>
			{children}
		</SidebarLayout>
	);
}
