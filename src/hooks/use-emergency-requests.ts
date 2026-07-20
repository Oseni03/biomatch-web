import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAlertsForDonor,
	getPendingEmergencyRequestsForHospital,
	getEmergencyHistory,
	expandSearchRadius,
	respondToAlert,
	updateAlertStatus,
	confirmDonation,
} from "@/servers/emergency";
import { toast } from "sonner";
import { POLL_INTERVAL_MS } from "@/lib/constants";

// Polling cadences below are a stopgap. See contexts/phase-3-realtime.md
// for the planned SSE replacement — don't duplicate that effort here.

export function useDonorAlerts(
	donorId?: string,
	filters?: { page?: number; pageSize?: number },
) {
	return useQuery({
		queryKey: ["donor-alerts", donorId, filters],
		queryFn: () => getAlertsForDonor(donorId!, filters),
		enabled: !!donorId,
		refetchInterval: POLL_INTERVAL_MS,
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

export function usePendingEmergencyRequests(
	hospitalId?: string,
	filters?: { page?: number; pageSize?: number },
) {
	return useQuery({
		queryKey: ["pending-emergency-requests", hospitalId, filters],
		queryFn: () =>
			getPendingEmergencyRequestsForHospital(hospitalId!, filters),
		enabled: !!hospitalId,
		refetchInterval: POLL_INTERVAL_MS,
	});
}

export function useEmergencyHistory(
	hospitalId?: string,
	filters?: {
		dateFrom?: string;
		dateTo?: string;
		bloodGroup?: string;
		status?: string;
		page?: number;
		pageSize?: number;
	},
) {
	return useQuery({
		queryKey: ["emergency-history", hospitalId, filters],
		queryFn: () => getEmergencyHistory(hospitalId!, filters),
		enabled: !!hospitalId,
	});
}

export function useConfirmDonation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ alertId }: { alertId: string }) =>
			confirmDonation(alertId),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["pending-emergency-requests"],
			});
			queryClient.invalidateQueries({
				queryKey: ["donor-alerts"],
			});
			toast.success(
				`Donation confirmed for ${data.donorName}. ${data.completedCount}/${data.unitsNeeded} units completed.`,
			);
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}

export function useExpandSearchRadius() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ requestId }: { requestId: string }) =>
			expandSearchRadius(requestId),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["pending-emergency-requests"],
			});
			if (data.expanded) {
				toast.success(
					`Radius expanded to ${data.searchRadius}km — ${data.newDonorsAdded} new donors alerted`,
				);
			} else if (data.reason === "max_radius_reached") {
				toast.error("Maximum search radius reached");
			} else if (data.reason === "max_alerts_reached") {
				toast.error("Maximum alert count reached");
			}
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}
