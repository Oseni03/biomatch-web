"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	cancelBloodRequest,
	closeBloodRequest,
	getActiveRequests,
	getRequestHistory,
	updateBloodRequest,
} from "@/servers/requests";

function invalidateRequestKeys(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: ["hospital-active-requests"] });
	queryClient.invalidateQueries({ queryKey: ["hospital-request-history"] });
}

export function useActiveRequests(
	organizationId?: string,
	callerId?: string,
	filters?: { page: number; pageSize: number },
) {
	return useQuery({
		queryKey: ["hospital-active-requests", organizationId, filters],
		queryFn: () => getActiveRequests(organizationId!, callerId!, filters),
		enabled: !!organizationId && !!callerId,
	});
}

export function useRequestHistory(
	organizationId?: string,
	callerId?: string,
	filters?: { page: number; pageSize: number },
) {
	return useQuery({
		queryKey: ["hospital-request-history", organizationId, filters],
		queryFn: () => getRequestHistory(organizationId!, callerId!, filters),
		enabled: !!organizationId && !!callerId,
	});
}

export function useUpdateRequest(organizationId: string, callerId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			requestId,
			input,
		}: {
			requestId: string;
			input: { unitsRequired?: number; locationName?: string; internalReference?: string | null };
		}) => updateBloodRequest(organizationId, callerId, requestId, input),
		onSuccess: () => invalidateRequestKeys(queryClient),
	});
}

export function useCloseRequest(organizationId: string, callerId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) => closeBloodRequest(organizationId, callerId, requestId),
		onSuccess: () => invalidateRequestKeys(queryClient),
	});
}

export function useCancelRequest(organizationId: string, callerId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) =>
			cancelBloodRequest(organizationId, callerId, requestId),
		onSuccess: () => invalidateRequestKeys(queryClient),
	});
}
