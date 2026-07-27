import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getPendingEmergencyRequestsForOrganization } from "@/servers/emergency";
import { getActiveOrganizationId } from "@/servers/organization";
import { HospitalDashboardShell } from "./dashboard-shell";

export default async function HospitalDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const organizationId = await getActiveOrganizationId(session.user.id);
	const filters = { page: 1, pageSize: 10 };

	await queryClient.prefetchQuery({
		queryKey: ["pending-emergency-requests", organizationId, filters],
		queryFn: () =>
			getPendingEmergencyRequestsForOrganization(organizationId, filters),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HospitalDashboardShell organizationId={organizationId}>
				{children}
			</HospitalDashboardShell>
		</HydrationBoundary>
	);
}
