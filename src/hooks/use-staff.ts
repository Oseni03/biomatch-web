import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getStaffMembers,
	inviteStaffMember,
	updateStaffRole,
	removeStaffMember,
	getMyStaffRole,
	type StaffRole,
} from "@/servers/staff";
import { toast } from "sonner";

export function useMyStaffRole(userId?: string) {
	return useQuery({
		queryKey: ["my-staff-role", userId],
		queryFn: () => getMyStaffRole(userId!),
		enabled: !!userId,
	});
}

export function useStaffMembers(hospitalId?: string) {
	return useQuery({
		queryKey: ["staff", hospitalId],
		queryFn: () => getStaffMembers(hospitalId!),
		enabled: !!hospitalId,
	});
}

export function useInviteStaffMember(hospitalId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			email,
			name,
			role,
			callerUserId,
		}: {
			email: string;
			name: string;
			role: StaffRole;
			callerUserId: string;
		}) => inviteStaffMember(hospitalId!, email, name, role, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", hospitalId] });
			toast.success("Staff member added");
		},
		onError: () => {
			toast.error("Failed to add staff member");
		},
	});
}

export function useUpdateStaffRole(hospitalId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			role,
			callerUserId,
		}: {
			userId: string;
			role: StaffRole;
			callerUserId: string;
		}) => updateStaffRole(userId, role, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", hospitalId] });
			toast.success("Role updated");
		},
		onError: () => {
			toast.error("Failed to update role");
		},
	});
}

export function useRemoveStaffMember(hospitalId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			userId,
			callerUserId,
		}: {
			userId: string;
			callerUserId: string;
		}) => removeStaffMember(userId, callerUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["staff", hospitalId] });
			toast.success("Staff member removed");
		},
		onError: () => {
			toast.error("Failed to remove staff member");
		},
	});
}
