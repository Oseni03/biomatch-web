import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { issueVoucher, listVouchersForDonor } from "@/servers/vouchers";

export function useMyVouchers(page = 1, pageSize = 10) {
	const { data: session } = authClient.useSession();
	return useQuery({
		queryKey: ["my-vouchers", session?.user?.id, page, pageSize],
		queryFn: () => listVouchersForDonor(session!.user!.id, { page, pageSize }),
		enabled: !!session?.user?.id,
	});
}

export function useIssueVoucher() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { merchantId: string; amountKobo: number; idempotencyKey: string }) =>
			issueVoucher(session!.user!.id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
			void queryClient.invalidateQueries({ queryKey: ["wallet-ledger"] });
			void queryClient.invalidateQueries({ queryKey: ["my-vouchers"] });
		},
	});
}
