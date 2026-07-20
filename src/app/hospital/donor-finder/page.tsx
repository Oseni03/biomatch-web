import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { listDonors } from "@/servers/user";
import { DonorFinderClient } from "./donor-finder-client";

export default async function DonorFinderPage() {
	const queryClient = getQueryClient();
	const filters = { page: 1, pageSize: 10 };

	await queryClient.prefetchQuery({
		queryKey: ["eligible-donors", filters],
		queryFn: () => listDonors(filters),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorFinderClient />
		</HydrationBoundary>
	);
}
