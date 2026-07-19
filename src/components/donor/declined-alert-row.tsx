"use client";

import { X } from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";

interface DeclinedAlertRowProps {
	request: EmergencyMatchRequest;
	onToggle: () => void;
}

export function DeclinedAlertRow({ request, onToggle }: DeclinedAlertRowProps) {
	return (
		<div className="bg-muted border-border rounded-xl p-4">
			<button
				onClick={onToggle}
				className="w-full flex items-center justify-between text-left"
			>
				<span className="flex items-center gap-2 text-xs text-muted-foreground">
					<X className="h-3.5 w-3.5 text-muted-foreground" />
					Declined — {request.hospitalName} ({request.bloodType})
				</span>
				<span className="text-[10px] text-muted-foreground font-mono">
					{new Date(request.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</button>
		</div>
	);
}
