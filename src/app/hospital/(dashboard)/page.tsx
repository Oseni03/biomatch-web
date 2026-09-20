import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getHospitalSidebarContext } from "@/servers/hospital";
import { HospitalBroadcastsClient } from "./hospital-broadcasts-client";

export default async function HospitalBroadcastsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(session.user.id);
	const context = await getHospitalSidebarContext(organizationId).catch(
		() => undefined,
	);
	const hospitalName =
		context?.hospitalName || session.user.name || "Hospital Account";

	return (
		<HospitalBroadcastsClient
			organizationId={organizationId}
			hospitalName={hospitalName}
		/>
	);
}
