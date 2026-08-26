import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { listDonors } from "@/servers/user";
import { getActiveOrganizationId } from "@/servers/organization";
import { DonorScreeningPanel } from "@/components/hospital/donor-screening-panel";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default async function HospitalScreeningPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const organizationId = await getActiveOrganizationId(session.user.id);
	const filters = { page: 1, pageSize: 10 };

	await queryClient.prefetchQuery({
		queryKey: ["eligible-donors", filters],
		queryFn: () => listDonors(filters),
	});

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Donor Screening"
				subtitle="Record walk-in blood screenings and resolve pending results"
			/>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<DonorScreeningPanel organizationId={organizationId} />
			</HydrationBoundary>
		</div>
	);
}
