import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { listActiveMerchants } from "@/servers/merchants";

export function useActiveMerchants() {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["active-merchants", session?.user?.id],
		queryFn: () => listActiveMerchants(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}
