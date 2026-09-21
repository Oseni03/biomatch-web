import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
	acceptConsents,
	getConsentStatus,
	updateMarketingConsent,
} from "@/servers/consent";

export function useConsentStatus() {
	const { data: session } = authClient.useSession();

	return useQuery({
		queryKey: ["consent-status", session?.user?.id],
		queryFn: () => getConsentStatus(),
		enabled: !!session?.user?.id,
	});
}

export function useAcceptConsents() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	return useMutation({
		mutationFn: (input?: { marketing?: boolean }) => acceptConsents(input),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["consent-status", session?.user?.id],
			});
		},
	});
}

export function useMarketingConsent() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	return useMutation({
		mutationFn: (granted: boolean) => updateMarketingConsent({ granted }),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["consent-status", session?.user?.id],
			});
		},
	});
}
