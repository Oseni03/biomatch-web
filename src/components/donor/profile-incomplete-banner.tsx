import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileIncompleteBanner({ className }: { className?: string }) {
	return (
		<section
			aria-label="Complete your donor profile"
			className={cn(
				"group relative overflow-hidden rounded-3xl border border-status-low/25",
				"bg-gradient-to-br from-status-low-bg via-card to-card",
				"p-5 shadow-card sm:p-6",
				className,
			)}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-status-low/15 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-status-low via-status-low/60 to-transparent"
			/>
			<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-status-low/30 bg-status-low/15 text-status-low shadow-card">
						<UserPlus className="size-5" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<p className="font-mono text-[11px] uppercase tracking-[0.14em] text-status-low">
							Action required
						</p>
						<p className="mt-1 text-sm font-bold tracking-tight text-foreground sm:text-[15px]">
							Complete your donor profile to unlock emergency matches
						</p>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
							Add your contact, location and health details so hospitals
							can send you emergency donation requests.
						</p>
					</div>
				</div>
				<Button asChild className="w-full shrink-0 sm:w-auto">
					<Link href="/donor/profile">
						Complete profile
						<ArrowRight
							aria-hidden="true"
							className="transition-transform duration-200 group-hover:translate-x-0.5"
						/>
					</Link>
				</Button>
			</div>
		</section>
	);
}
