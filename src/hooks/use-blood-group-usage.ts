import { useQuery } from "@tanstack/react-query";
import { getBloodGroupUsageSummary } from "@/servers/hospital";

export function useBloodGroupUsage() {
	return useQuery({
		queryKey: ["blood-group-usage"],
		queryFn: () => getBloodGroupUsageSummary(),
	});
}
