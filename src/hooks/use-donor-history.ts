import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getMyDonations } from "@/servers/donations";
import { getLocalDemandStats } from "@/servers/emergency";

export function useDonorHistory(page = 1) {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: ["donor-history", session?.user?.id, page],
		queryFn: async () => {
			const result = await getMyDonations(session!.user!.id, { page, pageSize: 10 });
			return {
				total: result.total,
				page,
				pageSize: 10,
				totalPages: Math.ceil(result.total / 10),
			};
		},
		enabled: !!session?.user?.id,
	});
}

export function useLocalDemandStats() {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: ["local-demand-stats", session?.user?.id],
		queryFn: () => getLocalDemandStats(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}
