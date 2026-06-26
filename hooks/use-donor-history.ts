import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getDonorHistory, getLocalDemandStats } from "@/servers/user";

export function useDonorHistory(page = 1) {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: ["donor-history", session?.user?.id, page],
		queryFn: () => getDonorHistory(session!.user!.id, page),
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
