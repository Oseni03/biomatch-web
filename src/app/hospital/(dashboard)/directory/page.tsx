import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { listDonors } from "@/servers/user";
import { DonorDirectory } from "@/components/hospital/donor-directory";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default async function HospitalDirectoryPage() {
	const queryClient = getQueryClient();
	const filters = { page: 1, pageSize: 50 };

	await queryClient.prefetchQuery({
		queryKey: ["eligible-donors", filters],
		queryFn: () => listDonors(filters),
	});

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Proactive Donor Directory"
				subtitle="Browse and reach out to registered donors before an emergency hits"
			/>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<DonorDirectory />
			</HydrationBoundary>
		</div>
	);
}
