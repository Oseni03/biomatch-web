"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HospitalNotificationsError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="rounded-2xl border border-border bg-card p-10 text-center">
			<Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-60" />
			<h2 className="text-base font-semibold text-foreground">
				Could not load notifications
			</h2>
			<p className="text-xs text-muted-foreground mt-1 mb-5">
				Dispatch updates are temporarily unavailable. Please try again.
			</p>
			<Button onClick={reset}>Try again</Button>
		</div>
	);
}
