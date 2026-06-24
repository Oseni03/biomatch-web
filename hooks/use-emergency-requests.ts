import { useQuery } from "@tanstack/react-query";
import {
	getActiveEmergencyRequests,
	getAlertsForDonor,
} from "@/servers/emergency";

export function useActiveEmergencyRequests() {
	return useQuery({
		queryKey: ["emergency-requests", "active"],
		queryFn: () => getActiveEmergencyRequests(),
		refetchInterval: 15_000,
	});
}

export function useDonorAlerts(donorId?: string) {
	return useQuery({
		queryKey: ["donor-alerts", donorId],
		queryFn: () => getAlertsForDonor(donorId!),
		enabled: !!donorId,
		refetchInterval: 15_000,
	});
}
