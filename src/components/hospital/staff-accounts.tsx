"use client";

import { authClient } from "@/lib/auth-client";
import type { InvitableRole } from "@/lib/organization-access";
import {
	useStaffMembers,
	useInviteStaffMember,
	useUpdateStaffRole,
	useRemoveStaffMember,
	useCancelStaffInvitation,
} from "@/hooks/use-staff";
import { StaffList } from "@/components/hospital/staff-list";
import { InviteStaffForm } from "@/components/hospital/invite-staff-form";

interface StaffAccountsProps {
	organizationId: string;
}

export function StaffAccounts({ organizationId }: StaffAccountsProps) {
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	const { data: staffList = [], isLoading: loading } =
		useStaffMembers(organizationId);
	const inviteMutation = useInviteStaffMember(organizationId);
	const updateRoleMutation = useUpdateStaffRole(organizationId);
	const removeMutation = useRemoveStaffMember(organizationId);
	const cancelInviteMutation = useCancelStaffInvitation(organizationId);

	const currentUserRole = staffList.find(
		(s) => s.status === "active" && s.userId === currentUserId,
	)?.role;
	const isAdmin = currentUserRole === "admin" || currentUserRole === "owner";

	const handleInvite = (email: string, role: InvitableRole) => {
		if (!currentUserId) return;
		inviteMutation.mutate({ email, role, callerUserId: currentUserId });
	};

	const handleRoleChange = (memberId: string, role: InvitableRole) => {
		if (!currentUserId) return;
		updateRoleMutation.mutate({ memberId, role, callerUserId: currentUserId });
	};

	const handleRemove = (memberId: string) => {
		if (!currentUserId) return;
		removeMutation.mutate({ memberId, callerUserId: currentUserId });
	};

	const handleCancelInvite = (invitationId: string) => {
		if (!currentUserId) return;
		cancelInviteMutation.mutate({
			invitationId,
			callerUserId: currentUserId,
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
			<StaffList
				staffList={staffList}
				loading={loading}
				isAdmin={isAdmin}
				currentUserId={currentUserId}
				onRoleChange={handleRoleChange}
				onRemove={handleRemove}
				onCancelInvite={handleCancelInvite}
			/>

			{isAdmin && <InviteStaffForm onSubmit={handleInvite} />}
		</div>
	);
}
