import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { listMerchants } from "@/servers/merchants";
import { MerchantsClient } from "./merchants-client";

export default async function AdminMerchantsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string; all?: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const params = await searchParams;
	const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
	const includeInactive = params.all === "1";

	const result = await listMerchants(session.user.id, {
		includeInactive,
		page,
		pageSize: 20,
	}).catch(() => null);

	if (!result) {
		redirect("/auth/login");
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Merchant management"
				subtitle="Affiliated marts and malls where donors redeem vouchers."
			/>

			<MerchantsClient
				merchants={result.merchants}
				page={result.page}
				totalPages={result.totalPages}
				total={result.total}
				includeInactive={includeInactive}
			/>

			{result.total === 0 && (
				<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
					<Store className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-2 text-sm font-semibold text-foreground">No merchants yet</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						Add the first affiliated mart or mall above. Donors can only redeem
						vouchers at active merchants.
					</p>
				</div>
			)}
		</div>
	);
}
