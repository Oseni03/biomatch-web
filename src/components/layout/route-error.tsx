"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RouteErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
	return (
		<div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
			<AlertTriangle className="h-8 w-8 text-destructive" />
			<div className="space-y-1">
				<p className="font-semibold text-foreground">
					Something went wrong
				</p>
				<p className="text-sm text-muted-foreground">
					{error.message || "An unexpected error occurred."}
				</p>
			</div>
			<Button onClick={reset} variant="outline">
				Try again
			</Button>
		</div>
	);
}
