"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import {
	ConsentChoicesFields,
	EMPTY_CONSENT_CHOICES,
	requiredConsentsAccepted,
	type ConsentChoices,
} from "@/components/consent/consent-choices";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Wordmark } from "@/components/brand/wordmark";
import { acceptConsents } from "@/servers/consent";

export function ConsentClient({
	next,
	marketingGranted,
}: {
	next: string | null;
	marketingGranted: boolean;
}) {
	const router = useRouter();
	const [choices, setChoices] = useState<ConsentChoices>({
		...EMPTY_CONSENT_CHOICES,
		marketing: marketingGranted,
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!requiredConsentsAccepted(choices)) {
			setError(
				"Please accept the Terms of Service, Privacy Policy and data processing consent to continue",
			);
			return;
		}

		setIsLoading(true);
		try {
			await acceptConsents({ marketing: choices.marketing });
			router.push(next ?? "/donor");
			router.refresh();
		} catch {
			setError("Could not save your consents. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<AuthShell
			eyebrow="Data Protection"
			headline={
				<>
					Your consent
					<br />
					<span className="italic text-brand">keeps you covered.</span>
				</>
			}
			description="BioMatch processes your data under the Nigeria Data Protection Regulation. Accept the current policies to continue."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Accept Updated Policies"
				subtitle="Our policies changed, or your consents are missing. Review and accept to continue using BioMatch."
				error={error}
				onSubmit={handleSubmit}
			>
				<div className="flex items-center gap-2 rounded-2xl border border-status-ok/25 bg-status-ok-bg p-4 text-sm text-status-ok">
					<ShieldCheck className="h-4 w-4 shrink-0" />
					<span>
						Required consents cannot be withdrawn later. To stop
						processing, you can delete your account at any time.
					</span>
				</div>
				<ConsentChoicesFields
					value={choices}
					onChange={setChoices}
					idPrefix="consent"
				/>
				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Saving..." : "Accept & Continue"}
				</Button>
			</AuthForm>
		</AuthShell>
	);
}
