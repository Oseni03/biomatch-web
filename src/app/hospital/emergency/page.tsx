import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getHospitalVerificationState } from "@/servers/hospital";
import { AwaitingApproval } from "@/components/hospital/awaiting-approval";
import { EmergencyRequestClient } from "./emergency-request-client";

export default async function EmergencyRequestPage() {
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

	return <EmergencyRequestClient organizationId={verification.organizationId} />;
}
