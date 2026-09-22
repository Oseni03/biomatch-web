import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getHospitalSidebarContext, getHospitalVerificationState } from "@/servers/hospital";
import { AwaitingApproval } from "@/components/hospital/awaiting-approval";
import { HospitalBroadcastsClient } from "./hospital-broadcasts-client";

export default async function HospitalBroadcastsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(session.user.id).catch(
		() => undefined,
	);
	const verification = organizationId
		? await getHospitalVerificationState(organizationId).catch(() => undefined)
		: undefined;
	if (!verification || verification.verificationStatus !== "approved") {
		return (
			<AwaitingApproval
				status={
					(verification?.verificationStatus as
						| "pending"
						| "rejected"
						| "suspended"
						| undefined) ?? "none"
				}
				hospitalName={verification?.hospitalName ?? ""}
			/>
		);
	}

	const context = await getHospitalSidebarContext(
		verification.organizationId,
	).catch(() => undefined);
	const hospitalName =
		context?.hospitalName || session.user.name || "Hospital Account";

	return (
		<HospitalBroadcastsClient
			organizationId={verification.organizationId}
			hospitalName={hospitalName}
		/>
	);
}
