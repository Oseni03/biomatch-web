import { ShieldX } from "lucide-react";

export function BlacklistedBanner() {
	return (
		<div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center gap-3">
			<ShieldX className="h-5 w-5 text-destructive shrink-0" />
			<div>
				<p className="text-sm font-semibold text-destructive">
					Your account has been blacklisted
				</p>
				<p className="text-xs text-destructive/80 mt-0.5">
					A partner hospital found an issue with a screening result
					and permanently suspended your eligibility for emergency
					donation requests. Contact a partner hospital if you
					believe this is a mistake.
				</p>
			</div>
		</div>
	);
}
