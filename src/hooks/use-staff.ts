import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getStaffMembers,
	inviteStaffMember,
	updateStaffRole,
	removeStaffMember,
	cancelStaffInvitation,
	getMyStaffRole,
} from "@/servers/staff";
import type { InvitableRole } from "@/lib/organization-access";
import { toast } from "sonner";

export function useMyStaffRole(userId?: string) {
	return useQuery({
		queryKey: ["my-staff-role", userId],
		queryFn: () => getMyStaffRole(userId!),
		enabled: !!userId,
	});
}

export function useStaffMembers(organizationId?: string) {
	return useQuery({
		queryKey: ["staff", organizationId],
		queryFn: () => getStaffMembers(organizationId!),
		enabled: !!organizationId,
	});
}

export function useInviteStaffMember(organizationId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			email,
			role,
			callerUserId,
		}: {
			email: string;
			role: InvitableRole;
			callerUserId: string;
		}) => inviteStaffMember(organizationId!, email, role, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staff", organizationId],
			});
			toast.success("Invitation sent");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to invite staff member",
			);
		},
	});
}

export function useUpdateStaffRole(organizationId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			memberId,
			role,
			callerUserId,
		}: {
			memberId: string;
			role: InvitableRole;
			callerUserId: string;
		}) => updateStaffRole(organizationId!, memberId, role, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staff", organizationId],
			});
			toast.success("Role updated");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update role",
			);
		},
	});
}

export function useRemoveStaffMember(organizationId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			memberId,
			callerUserId,
		}: {
			memberId: string;
			callerUserId: string;
		}) => removeStaffMember(organizationId!, memberId, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staff", organizationId],
			});
			toast.success("Staff member removed");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to remove staff member",
			);
		},
	});
}

export function useCancelStaffInvitation(organizationId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			invitationId,
			callerUserId,
		}: {
			invitationId: string;
			callerUserId: string;
		}) => cancelStaffInvitation(organizationId!, invitationId, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staff", organizationId],
			});
			toast.success("Invitation canceled");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to cancel invitation",
			);
		},
	});
}
