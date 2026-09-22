"use client";

import { useState } from "react";
import {
	BellRing,
	Building2,
	CheckCircle2,
	Droplets,
	HeartHandshake,
	Radio,
	UserRoundCheck,
	Users,
	Wallet,
	type LucideIcon,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WalkthroughAudience } from "@/servers/walkthrough";

type WalkthroughStep = {
	icon: LucideIcon;
	title: string;
	body: string;
};

const DONOR_STEPS: WalkthroughStep[] = [
	{
		icon: BellRing,
		title: "Urgent requests near you",
		body: "When a hospital nearby needs your blood group, you get notified by SMS, WhatsApp or email — and it lands in your inbox here.",
	},
	{
		icon: HeartHandshake,
		title: "Respond in one tap",
		body: "Accept when you can donate, mark yourself en route and arrived, or withdraw if plans change. No penalty for declining.",
	},
	{
		icon: UserRoundCheck,
		title: "Confirm the donation",
		body: "You and the hospital both confirm after you donate. A 3-month rest period starts, and your donation record updates.",
	},
	{
		icon: Wallet,
		title: "Earn rewards",
		body: "Every confirmed donation earns points in your Rewards wallet. Redeem vouchers with partner merchants.",
	},
];

const HOSPITAL_STEPS: WalkthroughStep[] = [
	{
		icon: Radio,
		title: "Broadcast an emergency",
		body: "Create a request with the blood group and units you need. Nearby screened donors are notified automatically.",
	},
	{
		icon: Droplets,
		title: "Watch donors respond",
		body: "The live status panel shows notified, accepted and en-route donors. Expand the search radius if it stays quiet.",
	},
	{
		icon: CheckCircle2,
		title: "Confirm on arrival",
		body: "Screen the donor on arrival, then confirm the donation. The donor enters a 3-month rest period.",
	},
	{
		icon: Users,
		title: "Team and settings",
		body: "Invite staff with roles under Team & Roles, and manage the workspace profile and notification channels under Account Settings.",
	},
	{
		icon: Building2,
		title: "Stay verified",
		body: "Keep your facility details current. Dispatch stays enabled while your verification is approved.",
	},
];

export function WalkthroughDialog({
	audience,
	open,
	onDone,
}: {
	audience: Exclude<WalkthroughAudience, "admin">;
	open: boolean;
	onDone: () => void;
}) {
	const steps = audience === "donor" ? DONOR_STEPS : HOSPITAL_STEPS;
	const [index, setIndex] = useState(0);
	const step = steps[index] ?? steps[0]!;
	const Icon = step.icon;
	const last = index === steps.length - 1;

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onDone()}>
			<DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
				<DialogHeader>
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
						<Icon className="h-6 w-6 text-brand" />
					</div>
					<DialogTitle className="text-center">
						{step.title}
					</DialogTitle>
					<DialogDescription className="text-center">
						{step.body}
					</DialogDescription>
				</DialogHeader>
				<div
					className="flex items-center justify-center gap-1.5"
					aria-label={`Step ${index + 1} of ${steps.length}`}
				>
					{steps.map((entry, position) => (
						<span
							key={entry.title}
							className={`h-1.5 rounded-full transition-all ${
								position === index
									? "w-6 bg-brand"
									: "w-1.5 bg-muted-foreground/30"
							}`}
						/>
					))}
				</div>
				<div className="flex items-center justify-between gap-2">
					<Button variant="ghost" onClick={onDone} className="rounded-xl">
						Skip tour
					</Button>
					<div className="flex gap-2">
						{index > 0 && (
							<Button
								variant="outline"
								onClick={() => setIndex(index - 1)}
								className="rounded-xl"
							>
								Back
							</Button>
						)}
						<Button
							onClick={() =>
								last ? onDone() : setIndex(index + 1)
							}
							className="rounded-xl"
						>
							{last ? "Get started" : "Next"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
