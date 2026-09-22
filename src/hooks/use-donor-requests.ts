import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getNotificationInbox,
	getRequestsNearby,
	markNotificationRead,
} from "@/servers/requests";

export function useRequestsNearby(
	donorId?: string,
	filters?: { page?: number; pageSize?: number },
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 10;
	return useQuery({
		queryKey: ["requests-nearby", donorId, page, pageSize],
		queryFn: () => getRequestsNearby(donorId!, { page, pageSize }),
		enabled: !!donorId,
	});
}

export function useNotificationInbox(
	donorId?: string,
	filters?: { page?: number; pageSize?: number; unreadOnly?: boolean },
) {
	const page = filters?.page ?? 1;
	const pageSize = filters?.pageSize ?? 20;
	const unreadOnly = filters?.unreadOnly ?? false;
	return useQuery({
		queryKey: ["notification-inbox", donorId, page, pageSize, unreadOnly],
		queryFn: () => getNotificationInbox(donorId!, { page, pageSize, unreadOnly }),
		enabled: !!donorId,
	});
}

export function useMarkNotificationRead(donorId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (notificationId: string) => markNotificationRead(notificationId, donorId!),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notification-inbox"] });
		},
	});
}
