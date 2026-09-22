import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { getMerchantDetail } from "@/servers/merchants";
import { MerchantDetailClient } from "./merchant-detail-client";

export default async function AdminMerchantDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const { id } = await params;
	const detail = await getMerchantDetail(session.user.id, id).catch(() => null);
	if (!detail) {
		notFound();
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={detail.merchant.name}
				subtitle={`${detail.merchant.category ?? "No category"}${detail.merchant.address ? ` · ${detail.merchant.address}` : ""}`}
				action={
					<StatusTag status={detail.merchant.isActive ? "ok" : "low"}>
						{detail.merchant.isActive ? "active" : "deactivated"}
					</StatusTag>
				}
			/>

			<MerchantDetailClient
				merchant={detail.merchant}
				staff={detail.staff}
			/>
		</div>
	);
}
