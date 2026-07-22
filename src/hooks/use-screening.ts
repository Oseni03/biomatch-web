import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getDonorVerificationStatus,
	getActiveScreeningForDonor,
	getScreeningHistoryForDonor,
	createScreening,
	resolveScreening,
} from "@/servers/screening";
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
}

export function useCreateScreening() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			donorId,
			hospitalId,
			staffUserId,
		}: {
			donorId: string;
			hospitalId: string;
			staffUserId: string;
		}) => createScreening(donorId, hospitalId, staffUserId),
		onSuccess: (_data, variables) => {
			invalidateScreeningQueries(queryClient, variables.donorId);
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
		}: {
			screeningId: string;
			status: "passed" | "failed";
			callerUserId: string;
			notes?: string;
			donorId: string;
		}) => resolveScreening(screeningId, status, callerUserId, notes),
		onSuccess: (_data, variables) => {
			invalidateScreeningQueries(queryClient, variables.donorId);
			toast.success("Screening resolved");
		},
		onError: (err: Error) => {
			toast.error(err.message);
		},
	});
}
