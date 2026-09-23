import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { permissionCatalog } from "@/lib/organization-access";
import { getActiveOrganizationId } from "@/servers/organization";
import {
	listCustomRoles,
	listMembers,
	listPendingInvitations,
	requireOrgManager,
} from "@/servers/team";
import { TeamClient } from "./team-client";

export default async function HospitalTeamPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const organizationId = await getActiveOrganizationId(session.user.id);
	const [members, roles, invitations, canManage] = await Promise.all([
		listMembers(organizationId, session.user.id),
		listCustomRoles(organizationId, session.user.id),
		listPendingInvitations(organizationId, session.user.id).catch(() => []),
		requireOrgManager(organizationId, session.user.id)
			.then(() => true)
			.catch(() => false),
	]);

	return (
		<TeamClient
			organizationId={organizationId}
			callerUserId={session.user.id}
			initialMembers={members}
			initialRoles={roles}
			initialInvitations={invitations}
			canManage={canManage}
			catalog={permissionCatalog}
		/>
	);
}
