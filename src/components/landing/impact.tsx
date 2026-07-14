"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMPACT_CARDS = [
	{
		icon: TrendingUp,
		stat: "2.3x",
		label: "Faster Response",
		description:
			"Average time to blood delivery reduced from 4 hours to 90 minutes",
	},
	{
		icon: Users,
		stat: "94%",
		label: "Donor Activation",
		description:
			"Active participation rate among registered donors responding to alerts",
	},
	{
		icon: Gauge,
		stat: "99.2%",
		label: "Match Accuracy",
		description:
			"AI-powered blood type compatibility matching with zero errors",
	},
];

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.12 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export function Impact() {
	return (
		<section
			id="impact"
			className="border-t border-border bg-neutral-950 px-4 py-20 md:py-28"
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
						Proven Results
					</p>
					<h2 className="text-3xl font-bold text-white md:text-4xl">
						Saving lives with precision and speed
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400">
						Our data shows measurable impact across every hospital
						we serve.
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid gap-6 md:grid-cols-3"
				>
					{IMPACT_CARDS.map((card, i) => {
						const Icon = card.icon;
						return (
							<motion.div
								key={i}
								variants={cardVariants}
								className="flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8"
							>
								<Icon className="h-8 w-8 text-brand" />
								<div>
									<div className="text-4xl font-black text-white md:text-5xl">
										{card.stat}
									</div>
									<h3 className="mb-2 mt-1 text-lg font-semibold text-white">
										{card.label}
									</h3>
									<p className="text-sm leading-relaxed text-neutral-400">
										{card.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="mx-auto mt-16 max-w-xl text-center"
				>
					<div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 md:p-10">
						<h3 className="text-2xl font-bold text-white md:text-3xl">
							Ready to save lives?
						</h3>
						<p className="mb-8 mt-3 text-neutral-400">
							Join thousands of verified donors or connect your
							hospital to our network today.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								size="lg"
								className="h-12 px-8 text-base font-semibold"
								asChild
							>
								<Link href="/auth/signup">
									Register as Donor
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="h-12 border-neutral-600 px-8 text-base font-semibold text-white hover:bg-neutral-800"
								asChild
							>
								<Link href="/auth/login">Hospital Portal</Link>
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
