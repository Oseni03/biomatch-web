import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getPendingEmergencyRequestsForHospital } from "@/servers/emergency";
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
	const hospitalId = session.user.id;
	const filters = { page: 1, pageSize: 10 };

	await queryClient.prefetchQuery({
		queryKey: ["pending-emergency-requests", hospitalId, filters],
		queryFn: () =>
			getPendingEmergencyRequestsForHospital(hospitalId, filters),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HospitalDashboardShell hospitalId={hospitalId}>
				{children}
			</HospitalDashboardShell>
		</HydrationBoundary>
	);
}
