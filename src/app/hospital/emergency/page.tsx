import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { EmergencyRequestClient } from "./emergency-request-client";

export default async function EmergencyRequestPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(session.user.id);

	return <EmergencyRequestClient organizationId={organizationId} />;
}
