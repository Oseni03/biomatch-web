import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { listDonors } from "@/servers/admin";
import { DonorsClient } from "./donors-client";

export default async function AdminDonorsPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string;
		blood?: string;
		verification?: string;
		state?: string;
		status?: string;
		page?: string;
	}>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const params = await searchParams;
	const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
	const filters = {
		search: params.search || undefined,
		bloodGroup: params.blood || undefined,
		verificationStatus: params.verification || undefined,
		state: params.state || undefined,
		donorStatus: params.status || undefined,
		page,
		pageSize: 20,
	};

	const result = await listDonors(session.user.id, filters).catch(() => null);

	if (!result) {
		redirect("/auth/login");
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Donor management"
				subtitle="Search donors, review verification and donations, restrict or reinstate accounts."
			/>

			<DonorsClient
				donors={result.donors}
				page={result.page}
				totalPages={result.totalPages}
				total={result.total}
				filters={{
					search: params.search ?? "",
					blood: params.blood ?? "",
					verification: params.verification ?? "",
					state: params.state ?? "",
					status: params.status ?? "",
				}}
			/>

			{result.total === 0 && (
				<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
					<Users className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-2 text-sm font-semibold text-foreground">No donors found</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						No donor accounts match these filters. Donors appear here once
						they register.
					</p>
				</div>
			)}
		</div>
	);
}
