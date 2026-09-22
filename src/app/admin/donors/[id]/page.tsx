import { redirect } from "next/navigation";
import { UserX } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { getDonorDetail } from "@/servers/admin";
import { DonorDetailClient } from "./donor-detail-client";

export default async function AdminDonorDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const { id } = await params;
	const detail = await getDonorDetail(session.user.id, id).catch(() => null);

	if (!detail) {
		return (
			<div className="space-y-8">
				<DashboardGreeting title="Donor not found" subtitle="This donor account does not exist." />
				<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
					<UserX className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-2 text-sm font-semibold text-foreground">No donor with this id</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						The account may have been deleted. Return to the donor list.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={detail.name || detail.email}
				subtitle={`${detail.donorCode} · ${detail.bloodGroup.replace("_POS", "+").replace("_NEG", "-")}`}
			/>
			<DonorDetailClient detail={detail} />
		</div>
	);
}
