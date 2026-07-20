import { useQuery } from "@tanstack/react-query";
import { getHospitalAnalytics } from "@/servers/analytics";

export function useHospitalAnalytics(
	hospitalId: string | undefined,
	dateRange?: { startDate: string; endDate: string },
) {
	return useQuery({
		queryKey: ["hospital-analytics", hospitalId, dateRange],
		queryFn: () => getHospitalAnalytics(hospitalId!, dateRange),
		enabled: !!hospitalId,
	});
}
