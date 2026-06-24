import { useQuery } from "@tanstack/react-query";
import { getAllHospitalBanks } from "@/servers/hospital";

export function useInventory() {
	return useQuery({
		queryKey: ["inventory"],
		queryFn: () => getAllHospitalBanks(),
		refetchInterval: 10_000,
	});
}
