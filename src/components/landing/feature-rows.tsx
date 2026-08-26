"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { EASE_SMOOTH } from "@/lib/animations";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { StatusTag } from "@/components/brand/status-tag";
import { InventoryGauge } from "@/components/brand/inventory-gauge";
import { EmergencyAlert } from "@/components/brand/emergency-alert";
import { cn } from "@/lib/utils";

interface FeatureRow {
	eyebrow: string;
	title: string;
	points: string[];
	mockup: React.ReactNode;
}

const ROWS: FeatureRow[] = [
	{
		eyebrow: "Register once, you're in the network",
		title: "One profile, every nearby hospital",
		points: [
			"Verify blood type and health profile in minutes",
			"Instant eligibility check on the 56-day donation cycle",
			"Update your status once, it stays current everywhere",
		],
		mockup: (
			<div className="w-full max-w-xs rounded-card border border-border bg-card p-5 shadow-card">
				<div className="flex items-center gap-3">
					<BloodTypeBadge bloodGroup="O_MINUS" size="md" />
					<div>
						<p className="text-sm font-bold text-foreground">Tomi Adeyemi</p>
						<p className="text-xs text-muted-foreground">Ikeja, Lagos</p>
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between border-t border-border pt-3">
					<span className="text-xs text-muted-foreground">Eligibility</span>
					<StatusTag status="ok">Ready to donate</StatusTag>
				</div>
			</div>
		),
	},
	{
		eyebrow: "Set it once, it repeats",
		title: "Stay on standby — we'll alert you",
		points: [
			"Real-time, radius-based donor matching",
			"Push notification with SMS fallback if it's missed",
			"Runs quietly in the background, day or night",
		],
		mockup: (
			<div className="w-full max-w-xs">
				<EmergencyAlert
					bloodGroup="O_MINUS"
					hospitalName="Lagos General Hospital"
					distanceKm={1.8}
				/>
			</div>
		),
	},
	{
		eyebrow: "Inventory, always current",
		title: "Hospitals see live stock, not guesswork",
		points: [
			"Blood-type and location search across partner banks",
			"Live gauges colored by urgency, updated in real time",
			"The busywork of phone-call inventory checks, gone",
		],
		mockup: (
			<div className="w-full max-w-xs space-y-4 rounded-card border border-border bg-card p-5 shadow-card">
				<InventoryGauge bloodGroup="O_MINUS" units={3} capacity={20} />
				<InventoryGauge bloodGroup="A_PLUS" units={8} capacity={20} />
				<InventoryGauge bloodGroup="AB_MINUS" units={17} capacity={20} />
			</div>
		),
	},
	{
		eyebrow: "The right donor, right when it matters",
		title: "Ranked by distance and compatibility",
		points: [
			"Matches ranked on proximity and blood-type compatibility",
			"Nothing slips through — auto radius expansion if no response",
			"The thoughtful ping, sent on time",
		],
		mockup: (
			<div className="w-full max-w-xs space-y-2 rounded-card border border-border bg-card p-4 shadow-card">
				{[
					{ n: "Tomi A.", d: "1.2 km", m: "98%" },
					{ n: "Femi K.", d: "2.4 km", m: "94%" },
				].map((row) => (
					<div
						key={row.n}
						className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
					>
						<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-[11px] font-bold text-brand">
							{row.n
								.split(" ")
								.map((p) => p[0])
								.join("")}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-semibold text-foreground">
								{row.n}
							</p>
							<p className="text-[11px] text-muted-foreground">{row.d}</p>
						</div>
						<span className="num text-xs font-bold text-status-ok">
							{row.m}
						</span>
					</div>
				))}
			</div>
		),
	},
	{
		eyebrow: "BioMatch never forgets",
		title: "Every donation, remembered",
		points: [
			"Full donation history, tracked automatically",
			"Recalls your eligibility the second you're ready again",
			"Points earned on every completed donation",
		],
		mockup: (
			<div className="w-full max-w-xs rounded-card border border-border bg-card p-5 shadow-card">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
					BioMatch Wallet
				</p>
				<p className="num mt-2 text-3xl font-bold text-foreground">
					2,450 <span className="text-base font-medium text-muted-foreground">pts</span>
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					<span className="num font-semibold text-brand">12</span> lifetime
					donations
				</p>
			</div>
		),
	},
];

function DotPagination({ active, total }: { active: number; total: number }) {
	return (
		<div className="mt-10 flex items-center justify-center gap-1.5">
			{Array.from({ length: total }).map((_, i) => (
				<span
					key={i}
					className={cn(
						"h-1.5 rounded-full transition-all",
						i === active ? "w-5 bg-brand" : "w-1.5 bg-border",
					)}
				/>
			))}
		</div>
	);
}

export function FeatureRows() {
	return (
		<section id="features" className="bg-paper px-4 py-4 md:py-8">
			<div className="mx-auto max-w-5xl">
				{ROWS.map((row, i) => (
					<motion.div
						key={row.title}
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.6, ease: EASE_SMOOTH }}
						className="border-t border-border py-16 first:border-t-0 md:py-20"
					>
						<div
							className={cn(
								"flex flex-col items-center gap-10 md:gap-16",
								i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
							)}
						>
							<div className="flex-1 text-center md:text-left">
								<p className="text-sm font-semibold uppercase tracking-widest text-brand">
									{row.eyebrow}
								</p>
								<h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-foreground md:text-3xl">
									{row.title}
								</h3>
								<ul className="mx-auto mt-6 max-w-sm space-y-3 text-left md:mx-0">
									{row.points.map((point) => (
										<li
											key={point}
											className="flex items-start gap-2.5 text-sm text-muted-foreground"
										>
											<Check className="mt-0.5 size-4 shrink-0 text-brand" />
											{point}
										</li>
									))}
								</ul>
								<Link
									href="/auth/signup"
									className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
								>
									Get Started
									<ArrowRight className="size-3.5" />
								</Link>
							</div>

							<div className="flex flex-1 justify-center">{row.mockup}</div>
						</div>

						<DotPagination active={i} total={ROWS.length} />
					</motion.div>
				))}
			</div>
		</section>
	);
}
