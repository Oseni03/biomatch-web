import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProfileIncompleteBanner() {
	return (
		<div className="bg-status-low-bg border border-status-low/20 rounded-2xl p-4 flex items-center gap-3">
			<AlertCircle className="h-5 w-5 text-status-low shrink-0" />
			<div className="flex-1">
				<p className="text-sm font-semibold text-foreground">
					Complete your donor profile to unlock emergency match requests.
				</p>
				<p className="text-xs text-muted-foreground mt-0.5">
					Hospitals need your health details before they can send you
					emergency donation requests.
				</p>
			</div>
			<Button asChild size="sm">
				<Link href="/donor/health-profile">Complete Profile</Link>
			</Button>
		</div>
	);
}
