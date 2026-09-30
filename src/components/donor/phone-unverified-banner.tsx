"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Smartphone, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getPhoneVerificationState } from "@/servers/user";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PhoneUnverifiedBanner({ className }: { className?: string }) {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id ?? null;
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!userId) return;
		let cancelled = false;
		try {
			if (
				typeof window !== "undefined" &&
				window.localStorage.getItem(`biomatch-hide-phone-banner:${userId}`) === "1"
			) {
				return;
			}
		} catch {
			// Storage unavailable: fall through and show the banner.
		}
		getPhoneVerificationState(userId)
			.then((state) => {
				if (!cancelled && state.phoneNumberVerified !== true) {
					setVisible(true);
				}
			})
			.catch(() => {
				if (!cancelled) setVisible(false);
			});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	if (!visible || !userId) return null;

	return (
		<section
			aria-label="Verify your phone number"
			className={cn(
				"group relative overflow-hidden rounded-3xl border border-brand/25",
				"bg-gradient-to-br from-brand/10 via-card to-card",
				"p-5 shadow-card sm:p-6",
				className,
			)}
		>
			<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-brand/30 bg-brand/15 text-brand shadow-card">
						<Smartphone className="size-5" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<p className="text-sm font-bold tracking-tight text-foreground sm:text-[15px]">
							Verify your phone to get SMS and WhatsApp emergency alerts
						</p>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
							Those are the fastest channels when urgent blood is needed
							near you. Without verification you still get in-app and
							email alerts.
						</p>
					</div>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<Button asChild className="w-full sm:w-auto">
						<Link href="/donor/profile">
							Verify phone
							<ArrowRight
								aria-hidden="true"
								className="transition-transform duration-200 group-hover:translate-x-0.5"
							/>
						</Link>
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Dismiss phone verification reminder"
						onClick={() => {
							try {
								window.localStorage.setItem(
									`biomatch-hide-phone-banner:${userId}`,
									"1",
								);
							} catch {
								// Storage unavailable: just hide for this visit.
							}
							setVisible(false);
						}}
					>
						<X className="size-4" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</section>
	);
}
