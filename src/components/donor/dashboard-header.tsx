"use client";

import { getGreeting } from "@/lib/donor-dashboard";

export function DashboardHeader({ name }: { name: string }) {
	return (
		<div className="space-y-1.5">
			<h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
				{getGreeting()}, {name}
			</h1>
			<p className="text-sm text-muted-foreground">
				You are currently on standby to save lives across emergency hospitals in
				your area.
			</p>
		</div>
	);
}
