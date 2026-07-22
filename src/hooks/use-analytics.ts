import { useQuery } from "@tanstack/react-query";
import { getHospitalAnalytics } from "@/servers/analytics";

export function useHospitalAnalytics(
	organizationId: string | undefined,
	dateRange?: { startDate: string; endDate: string },
) {
	return useQuery({
		queryKey: ["hospital-analytics", organizationId, dateRange],
		queryFn: () => getHospitalAnalytics(organizationId!, dateRange),
		enabled: !!organizationId,
	});
}
