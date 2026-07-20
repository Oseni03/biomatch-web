import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getWalletByUserId } from "@/servers/user";
import { DonorWalletClient } from "./donor-wallet-client";

export default async function DonorWalletPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await queryClient.prefetchQuery({
		queryKey: ["wallet", userId],
		queryFn: () => getWalletByUserId(userId),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorWalletClient />
		</HydrationBoundary>
	);
}
