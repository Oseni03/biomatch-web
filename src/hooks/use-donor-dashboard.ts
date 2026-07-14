import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getUserById } from "@/servers/user";

export function useDonorDashboard() {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["donor-dashboard", session?.user?.id],
		queryFn: () => getUserById(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}
