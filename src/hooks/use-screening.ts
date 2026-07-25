import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getDonorVerificationStatus,
	getActiveScreeningForDonor,
	getScreeningForAlert,
	getScreeningHistoryForDonor,
	createScreening,
	resolveScreening,
} from "@/servers/screening";
import type { ScreeningFailureConsequence } from "@/servers/screening";
import { toast } from "sonner";

export function useDonorVerificationStatus(donorId?: string) {
	return useQuery({
		queryKey: ["donor-verification-status", donorId],
		queryFn: () => getDonorVerificationStatus(donorId!),
		enabled: !!donorId,
	});
}

export function useActiveScreening(donorId?: string) {
	return useQuery({
		queryKey: ["active-screening", donorId],
		queryFn: () => getActiveScreeningForDonor(donorId!),
		enabled: !!donorId,
	});
}

export function useScreeningForAlert(alertId?: string) {
	return useQuery({
		queryKey: ["screening-for-alert", alertId],
		queryFn: () => getScreeningForAlert(alertId!),
		enabled: !!alertId,
	});
}

export function useScreeningHistory(donorId?: string) {
	return useQuery({
		queryKey: ["screening-history", donorId],
		queryFn: () => getScreeningHistoryForDonor(donorId!),
		enabled: !!donorId,
	});
}

function invalidateScreeningQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	donorId: string,
	alertId?: string,
) {
	queryClient.invalidateQueries({
		queryKey: ["active-screening", donorId],
	});
	queryClient.invalidateQueries({
		queryKey: ["donor-verification-status", donorId],
	});
	queryClient.invalidateQueries({
		queryKey: ["screening-history", donorId],
	});
	queryClient.invalidateQueries({ queryKey: ["eligible-donors"] });
	if (alertId) {
		queryClient.invalidateQueries({
			queryKey: ["screening-for-alert", alertId],
		});
		queryClient.invalidateQueries({
			queryKey: ["pending-emergency-requests"],
		});
	}
}

export function useCreateScreening() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			donorId,
			organizationId,
			staffUserId,
			alertId,
		}: {
			donorId: string;
			organizationId: string;
			staffUserId: string;
			alertId?: string;
		}) => createScreening(donorId, organizationId, staffUserId, alertId),
		onSuccess: (_data, variables) => {
			invalidateScreeningQueries(
				queryClient,
				variables.donorId,
				variables.alertId,
			);
			toast.success("Screening started");
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}

export function useResolveScreening() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			screeningId,
			status,
			callerUserId,
			notes,
			consequence,
		}: {
			screeningId: string;
			status: "passed" | "failed";
			callerUserId: string;
			notes?: string;
			donorId: string;
			alertId?: string;
			consequence?: ScreeningFailureConsequence;
		}) =>
			resolveScreening(screeningId, status, callerUserId, notes, consequence),
		onSuccess: (_data, variables) => {
			invalidateScreeningQueries(
				queryClient,
				variables.donorId,
				variables.alertId,
			);
			toast.success("Screening resolved");
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}
