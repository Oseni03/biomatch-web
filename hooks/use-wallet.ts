import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getWalletByUserId } from "@/servers/wallet";

export function useWallet() {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["wallet", session?.user?.id],
		queryFn: () => getWalletByUserId(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}
