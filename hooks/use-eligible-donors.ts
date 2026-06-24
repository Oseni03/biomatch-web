import { useQuery } from "@tanstack/react-query";
import { listDonors } from "@/servers/user";

export function useEligibleDonors() {
	return useQuery({
		queryKey: ["eligible-donors"],
		queryFn: () => listDonors({ eligibleOnly: true, pageSize: 20 }),
	});
}
