import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getWalletBalance, getWalletLedger } from "@/servers/wallet";

export function useWalletBalance() {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["wallet-balance", session?.user?.id],
		queryFn: () => getWalletBalance(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}

export function useWalletLedger(page = 1, pageSize = 10) {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["wallet-ledger", session?.user?.id, page, pageSize],
		queryFn: () => getWalletLedger(session!.user!.id, { page, pageSize }),
		enabled: !!session?.user?.id,
	});
}
