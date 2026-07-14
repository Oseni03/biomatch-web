import { useQuery } from "@tanstack/react-query";
import { getHospitalAnalytics } from "@/servers/analytics";

export function useHospitalAnalytics(hospitalId: string | undefined) {
	return useQuery({
		queryKey: ["hospital-analytics", hospitalId],
		queryFn: () => getHospitalAnalytics(hospitalId!),
		enabled: !!hospitalId,
	});
}
