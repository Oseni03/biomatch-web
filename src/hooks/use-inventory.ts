import { useQuery } from "@tanstack/react-query";
import { getAllHospitalBanks } from "@/servers/hospital";
import { POLL_INTERVAL_MS } from "@/lib/constants";

export function useInventory() {
	return useQuery({
		queryKey: ["inventory"],
		queryFn: () => getAllHospitalBanks(),
		refetchInterval: POLL_INTERVAL_MS,
	});
}
