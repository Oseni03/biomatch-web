import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getHospitalAnalytics } from "@/servers/analytics";
import { getActiveOrganizationId } from "@/servers/organization";
import { AnalyticsDashboard } from "@/components/hospital/analytics-dashboard";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default async function HospitalAnalyticsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const organizationId = await getActiveOrganizationId(session.user.id);

	const today = new Date().toISOString().split("T")[0];
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const dateRange = { startDate: thirtyDaysAgo, endDate: today };

	await queryClient.prefetchQuery({
		queryKey: ["hospital-analytics", organizationId, dateRange],
		queryFn: () => getHospitalAnalytics(organizationId, dateRange),
	});

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Analytics & Reports"
				subtitle="Response times, fulfillment rates, and coverage gaps across your emergency requests"
			/>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<AnalyticsDashboard organizationId={organizationId} />
			</HydrationBoundary>
		</div>
	);
}
