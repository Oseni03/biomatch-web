import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
	completeWalkthrough,
	getWalkthroughState,
	resetWalkthrough,
} from "@/servers/walkthrough";

export function useWalkthroughState() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	return useQuery({
		queryKey: ["walkthrough-state", userId],
		queryFn: () => getWalkthroughState(userId!),
		enabled: !!userId,
		staleTime: 60_000,
	});
}

export function useCompleteWalkthrough() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => completeWalkthrough(userId!),
		onSuccess: () => {
			queryClient.setQueryData(["walkthrough-state", userId], {
				completed: true,
			});
			void queryClient.invalidateQueries({
				queryKey: ["walkthrough-state", userId],
			});
		},
	});
}

export function useResetWalkthrough() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => resetWalkthrough(userId!),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["walkthrough-state", userId],
			});
		},
	});
}
