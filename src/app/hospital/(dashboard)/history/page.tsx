import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getEmergencyHistory } from "@/servers/emergency";
import { EmergencyHistory } from "@/components/hospital/emergency-history";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default async function HospitalHistoryPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const hospitalId = session.user.id;
	const filters = { page: 1, pageSize: 10 };

	await queryClient.prefetchQuery({
		queryKey: ["emergency-history", hospitalId, filters],
		queryFn: () => getEmergencyHistory(hospitalId, filters),
	});

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Request History"
				subtitle="Review completed, expired, and cancelled emergency requests"
			/>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<EmergencyHistory hospitalId={hospitalId} />
			</HydrationBoundary>
		</div>
	);
}
