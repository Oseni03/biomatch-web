"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { PhoneVerification } from "@/components/profile/phone-verification";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Wordmark } from "@/components/brand/wordmark";

export function VerifyPhoneClient({ next }: { next: string }) {
	const router = useRouter();

	return (
		<AuthShell
			eyebrow="Phone Verification"
			headline={
				<>
					Get emergency alerts
					<br />
					within <span className="italic text-brand">seconds.</span>
				</>
			}
			description="Add your phone number so hospitals can reach you by SMS and WhatsApp when urgent blood is needed near you. Without a verified number you still get in-app and email alerts."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Verify Your Phone"
				subtitle="Optional — you can do this later from your profile."
				error=""
				onSubmit={(e) => e.preventDefault()}
			>
				<PhoneVerification />
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push(next)}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					Verify later — take me to my dashboard
				</Button>
			</AuthForm>
		</AuthShell>
	);
}
