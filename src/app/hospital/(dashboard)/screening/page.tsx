import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId, requireOrgPermission } from "@/servers/organization";
import { listRecentScreenings } from "@/servers/screening";
import { ScreeningClient } from "./screening-client";

export default async function HospitalScreeningPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const organizationId = await getActiveOrganizationId(session.user.id);
	const canRecord = await requireOrgPermission(organizationId, session.user.id, {
		donor: ["recordScreening"],
	})
		.then(() => true)
		.catch(() => false);
	const recent = await listRecentScreenings(organizationId, session.user.id);

	return (
		<ScreeningClient
			organizationId={organizationId}
			callerUserId={session.user.id}
			canRecord={canRecord}
			initialRecent={recent.screenings}
		/>
	);
}
