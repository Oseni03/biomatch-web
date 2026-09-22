import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
	getMerchantPortalContext,
	listMerchantRedemptions,
	previewVoucherCode,
	redeemVoucherCode,
} from "@/servers/merchants";

export function useMerchantContext() {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["merchant-context", session?.user?.id],
		queryFn: () => getMerchantPortalContext(session!.user!.id),
		enabled: !!session?.user?.id,
	});
}

export function usePreviewVoucher() {
	const { data: session } = authClient.useSession();
	return useMutation({
		mutationFn: (code: string) => previewVoucherCode(session!.user!.id, code),
	});
}

export function useRedeemVoucher() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (code: string) => redeemVoucherCode(session!.user!.id, code),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["merchant-redemptions"] });
		},
	});
}

export function useMerchantRedemptions(page = 1, pageSize = 20) {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["merchant-redemptions", session?.user?.id, page, pageSize],
		queryFn: () => listMerchantRedemptions(session!.user!.id, { page, pageSize }),
		enabled: !!session?.user?.id,
	});
}
