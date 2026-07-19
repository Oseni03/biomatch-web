import { CheckCircle2 } from "lucide-react";

export function EligibilityBanner() {
	return (
		<div className="bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/50 rounded-2xl p-4 flex items-center gap-3">
			<CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
			<div>
				<p className="text-sm font-semibold text-green-800 dark:text-green-300">
					You are eligible to donate again!
				</p>
				<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
					Your 56-day deferral period has ended. Check for active
					emergency requests above.
				</p>
			</div>
		</div>
	);
}
