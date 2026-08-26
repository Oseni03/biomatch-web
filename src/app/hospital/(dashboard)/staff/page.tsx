import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getStaffMembers } from "@/servers/staff";
import { getActiveOrganizationId } from "@/servers/organization";
import { StaffAccounts } from "@/components/hospital/staff-accounts";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

export default async function HospitalStaffPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const organizationId = await getActiveOrganizationId(session.user.id);

	await queryClient.prefetchQuery({
		queryKey: ["staff", organizationId],
		queryFn: () => getStaffMembers(organizationId),
	});

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Hospital Staff Accounts"
				subtitle="Manage who on your team can respond to emergency requests and manage inventory."
			/>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<StaffAccounts organizationId={organizationId} />
			</HydrationBoundary>
		</div>
	);
}
