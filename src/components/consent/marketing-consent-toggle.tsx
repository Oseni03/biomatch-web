"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useConsentStatus, useMarketingConsent } from "@/hooks/use-consent";

export function MarketingConsentToggle() {
	const { data: status, isLoading } = useConsentStatus();
	const marketing = useMarketingConsent();
	const [pending, setPending] = useState(false);

	if (isLoading || !status) {
		return (
			<p className="text-xs text-muted-foreground">Loading preferences...</p>
		);
	}

	const handleChange = async (granted: boolean) => {
		setPending(true);
		try {
			await marketing.mutateAsync(granted);
			toast.success(
				granted
					? "Product updates enabled."
					: "Product updates disabled. Your choice was saved.",
			);
		} catch {
			toast.error("Could not save your preference. Please try again.");
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="flex items-start justify-between gap-4">
			<div className="space-y-0.5">
				<p className="text-sm font-semibold text-foreground">Product updates</p>
				<p className="text-xs leading-relaxed text-muted-foreground">
					Occasional messages about new BioMatch features. Required
					consents (terms, privacy, data processing) cannot be switched
					off here — to stop processing, delete your account.
				</p>
			</div>
			<Switch
				checked={status.marketingGranted}
				disabled={pending || marketing.isPending}
				onCheckedChange={handleChange}
				aria-label="Product updates"
			/>
		</div>
	);
}
