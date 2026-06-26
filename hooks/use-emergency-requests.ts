import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getActiveEmergencyRequests,
	getAlertsForDonor,
	getPendingEmergencyRequestsForHospital,
	getEmergencyRequestStatus,
	getEmergencyHistory,
	expandSearchRadius,
	respondToAlert,
	updateAlertStatus,
	confirmDonation,
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

export function usePendingEmergencyRequests(hospitalId?: string) {
	return useQuery({
		queryKey: ["pending-emergency-requests", hospitalId],
		queryFn: () => getPendingEmergencyRequestsForHospital(hospitalId!),
		enabled: !!hospitalId,
		refetchInterval: 15_000,
	});
}

export function useEmergencyRequestStatus(requestId?: string) {
	return useQuery({
		queryKey: ["emergency-request-status", requestId],
		queryFn: () => getEmergencyRequestStatus(requestId!),
		enabled: !!requestId,
		refetchInterval: 5_000,
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
				queryKey: ["emergency-request-status", data.requestId],
			});
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
