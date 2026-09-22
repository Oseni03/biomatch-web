import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getMerchantPortalContext, listMerchantRedemptions } from "@/servers/merchants";
import { MerchantPortalClient } from "./merchant-portal-client";

export default async function MerchantPortalPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const userId = session.user.id;
	const context = await getMerchantPortalContext(userId).catch(() => null);

	const queryClient = getQueryClient();
	if (context) {
		await Promise.all([
			queryClient.prefetchQuery({
				queryKey: ["merchant-context", userId],
				queryFn: () => getMerchantPortalContext(userId),
			}),
			queryClient.prefetchQuery({
				queryKey: ["merchant-redemptions", userId, 1, 20],
				queryFn: () => listMerchantRedemptions(userId, { page: 1, pageSize: 20 }),
			}),
		]);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MerchantPortalClient hasAccess={context !== null} />
		</HydrationBoundary>
	);
}
