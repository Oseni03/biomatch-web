import { CheckCircle2 } from "lucide-react";

export function EligibilityBanner() {
	return (
		<div className="bg-status-ok-bg border border-status-ok/20 rounded-2xl p-4 flex items-center gap-3">
			<CheckCircle2 className="h-5 w-5 text-status-ok shrink-0" />
			<div>
				<p className="text-sm font-semibold text-status-ok">
					You are eligible to donate again!
				</p>
				<p className="text-xs text-status-ok/80 mt-0.5">
					Your 56-day deferral period has ended. Check for active
					emergency requests above.
				</p>
			</div>
		</div>
	);
}
