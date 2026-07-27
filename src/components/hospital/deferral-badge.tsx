import { StatusTag } from "@/components/brand/status-tag";

export function DeferralBadge({
	deferredUntil,
	blacklistedAt,
}: {
	deferredUntil: Date | string | null;
	blacklistedAt: Date | string | null;
}) {
	if (blacklistedAt) {
		return <StatusTag status="critical">Blacklisted</StatusTag>;
	}

	if (deferredUntil && new Date(deferredUntil) > new Date()) {
		return (
			<StatusTag status="low">
				Deferred until{" "}
				{new Date(deferredUntil).toLocaleDateString()}
			</StatusTag>
		);
	}

	return null;
}
