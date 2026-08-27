import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileIncompleteBannerProps {
	onClick?: () => void;
}

export function ProfileIncompleteBanner({ onClick }: ProfileIncompleteBannerProps) {
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
			<Button size="sm" onClick={onClick}>
				Complete Profile
			</Button>
		</div>
	);
}
