"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getNotificationPreferences,
	updateNotificationPreferences,
} from "@/servers/delivery";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const CHANNELS = [
	{ key: "sms", label: "SMS", hint: "Text alerts to your verified phone" },
	{ key: "whatsapp", label: "WhatsApp", hint: "Template alerts to your verified phone" },
	{ key: "email", label: "Email", hint: "A copy of every notification" },
	{ key: "push", label: "Push", hint: "Reserved for a future app release" },
] as const;

export function NotificationPreferencesCard() {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	const queryClient = useQueryClient();
	const [saved, setSaved] = useState(false);
	const { data: prefs } = useQuery({
		queryKey: ["notification-preferences", userId],
		queryFn: () => getNotificationPreferences(userId!),
		enabled: !!userId,
	});
	const save = useMutation({
		mutationFn: (input: { sms?: boolean; whatsapp?: boolean; email?: boolean; push?: boolean }) =>
			updateNotificationPreferences(userId!, input),
		onSuccess: (next) => {
			queryClient.setQueryData(["notification-preferences", userId], next);
			setSaved(true);
			window.setTimeout(() => setSaved(false), 2500);
		},
	});

	return (
		<section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
				<BellRing className="h-4 w-4" />
				How you get alerted
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				SMS and WhatsApp need a verified phone number. Urgent matches always
				appear in your inbox here.
			</p>
			<ul className="mt-4 space-y-3">
				{CHANNELS.map((channel) => (
					<li key={channel.key} className="flex items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-foreground">{channel.label}</p>
							<p className="text-xs text-muted-foreground">{channel.hint}</p>
						</div>
						<Switch
							checked={prefs?.[channel.key] ?? true}
							disabled={!prefs || save.isPending}
							onCheckedChange={(checked) =>
								save.mutate({ [channel.key]: checked })
							}
							aria-label={`${channel.label} notifications`}
						/>
					</li>
				))}
			</ul>
			{saved && (
				<p className="mt-3 text-xs font-semibold text-emerald-600">
					Preferences saved.
				</p>
			)}
			{save.isError && (
				<Button
					variant="outline"
					size="sm"
					className="mt-3 rounded-xl"
					onClick={() => save.reset()}
				>
					Dismiss error
				</Button>
			)}
		</section>
	);
}
