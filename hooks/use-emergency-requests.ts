import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getActiveEmergencyRequests,
	getAlertsForDonor,
	respondToAlert,
	updateAlertStatus,
} from "@/servers/emergency";
import { toast } from "sonner";

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

export function useRespondToAlert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			alertId,
			status,
		}: {
			alertId: string;
			status: "accepted" | "declined";
		}) => respondToAlert(alertId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}

export function useUpdateAlertStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			alertId,
			status,
		}: {
			alertId: string;
			status: "en_route" | "arrived" | "completed";
		}) => updateAlertStatus(alertId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}
