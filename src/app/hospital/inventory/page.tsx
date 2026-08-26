import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getAllHospitalBanks, getBloodGroupUsageSummary } from "@/servers/hospital";
import { listDonors } from "@/servers/user";
import { HospitalInventoryClient } from "./inventory-client";

export default async function HospitalInventoryPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const donorFilters = { eligibleOnly: true };

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["inventory"],
			queryFn: () => getAllHospitalBanks(),
		}),
		queryClient.prefetchQuery({
			queryKey: ["eligible-donors", donorFilters],
			queryFn: () => listDonors({ pageSize: 20, ...donorFilters }),
		}),
		queryClient.prefetchQuery({
			queryKey: ["blood-group-usage"],
			queryFn: () => getBloodGroupUsageSummary(),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HospitalInventoryClient />
		</HydrationBoundary>
	);
}
