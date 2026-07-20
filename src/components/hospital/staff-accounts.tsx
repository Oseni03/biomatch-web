"use client";

import { authClient } from "@/lib/auth-client";
import type { StaffRole } from "@/servers/staff";
import {
	useStaffMembers,
	useInviteStaffMember,
	useUpdateStaffRole,
	useRemoveStaffMember,
} from "@/hooks/use-staff";
import { StaffList } from "@/components/hospital/staff-list";
import { InviteStaffForm } from "@/components/hospital/invite-staff-form";

interface StaffAccountsProps {
	hospitalId: string;
}

export function StaffAccounts({ hospitalId }: StaffAccountsProps) {
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	const { data: staffList = [], isLoading: loading } =
		useStaffMembers(hospitalId);
	const inviteMutation = useInviteStaffMember(hospitalId);
	const updateRoleMutation = useUpdateStaffRole(hospitalId);
	const removeMutation = useRemoveStaffMember(hospitalId);

	const currentUserRole = staffList.find(
		(s) => s.id === currentUserId,
	)?.role;
	const isAdmin = currentUserRole === "admin";

	const handleInvite = (name: string, email: string, role: StaffRole) => {
		if (!currentUserId) return;
		inviteMutation.mutate({ email, name, role, callerUserId: currentUserId });
	};

	const handleRoleChange = (userId: string, role: StaffRole) => {
		if (!currentUserId) return;
		updateRoleMutation.mutate({ userId, role, callerUserId: currentUserId });
	};

	const handleRemove = (userId: string) => {
		if (!currentUserId) return;
		removeMutation.mutate({ userId, callerUserId: currentUserId });
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
			/>

			{isAdmin && <InviteStaffForm onSubmit={handleInvite} />}
		</div>
	);
}
