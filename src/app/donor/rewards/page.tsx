import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getWalletBalance, getWalletLedger } from "@/servers/wallet";
import { RewardsClient } from "./rewards-client";

export default async function DonorRewardsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["wallet-balance", userId],
			queryFn: () => getWalletBalance(userId),
		}),
		queryClient.prefetchQuery({
			queryKey: ["wallet-ledger", userId, 1, 10],
			queryFn: () => getWalletLedger(userId, { page: 1, pageSize: 10 }),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RewardsClient />
		</HydrationBoundary>
	);
}
