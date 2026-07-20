"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, HeartHandshake } from "lucide-react";

const STEPS = [
	{
		number: "01",
		icon: UserPlus,
		title: "Register",
		description:
			"Create your account as a donor or hospital in under two minutes. Provide your basic health information and location.",
	},
	{
		number: "02",
		icon: Search,
		title: "Find or Donate Blood",
		description:
			"Search the inventory for available blood types or respond to emergency alerts from nearby hospitals.",
	},
	{
		number: "03",
		icon: HeartHandshake,
		title: "Save Lives",
		description:
			"Complete a donation and track your real impact. Every donation earns points redeemable for exclusive perks.",
	},
];

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.15 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" as const },
	},
};

export function HowItWorks() {
	return (
		<section
			id="how-it-works"
			className="border-t border-border bg-background px-4 py-20 md:py-28"
		>
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mb-14 text-center"
				>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
						How It Works
					</p>
					<h2 className="text-3xl font-bold text-foreground md:text-4xl">
						Three steps to save a life
					</h2>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid gap-6 md:grid-cols-3"
				>
					{STEPS.map((step) => {
						const Icon = step.icon;
						return (
							<motion.div
								key={step.number}
								variants={cardVariants}
								className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-card"
							>
								<span className="text-5xl font-black text-brand/10">
									{step.number}
								</span>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
									<Icon className="h-5 w-5" />
								</div>
								<div>
									<h3 className="mb-2 text-xl font-bold text-foreground">
										{step.title}
									</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{step.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				<div className="mx-auto mt-12 hidden h-px max-w-lg bg-border md:block" />
			</div>
		</section>
	);
}
