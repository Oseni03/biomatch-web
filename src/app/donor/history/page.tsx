import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getUserById } from "@/servers/user";
import { getDonorHistory, getLocalDemandStats } from "@/servers/emergency";
import { DonorHistoryClient } from "./donor-history-client";

export default async function DonorHistoryPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["donor-dashboard", userId],
			queryFn: () => getUserById(userId),
		}),
		queryClient.prefetchQuery({
			queryKey: ["donor-history", userId, 1],
			queryFn: () => getDonorHistory(userId, 1),
		}),
		queryClient.prefetchQuery({
			queryKey: ["local-demand-stats", userId],
			queryFn: () => getLocalDemandStats(userId),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorHistoryClient />
		</HydrationBoundary>
	);
}
