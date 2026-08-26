"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Gauge } from "lucide-react";
import { EASE_SMOOTH, fadeUpStagger, cardVariants } from "@/lib/animations";

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
			"Compatibility-checked matching between donor and hospital blood type",
	},
];

export function Impact() {
	return (
		<section id="impact" className="bg-ink px-4 py-20 md:py-28">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: EASE_SMOOTH }}
					className="mb-14 text-center"
				>
					<p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
						Proven Results
					</p>
					<h2 className="font-serif text-3xl font-medium text-white md:text-4xl">
						Saving lives with precision and speed
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
						Our data shows measurable impact across every hospital we
						serve.
					</p>
				</motion.div>

				<motion.div
					variants={fadeUpStagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid gap-6 md:grid-cols-3"
				>
					{IMPACT_CARDS.map((card) => {
						const Icon = card.icon;
						return (
							<motion.div
								key={card.label}
								variants={cardVariants}
								className="flex flex-col gap-4 rounded-card border border-white/10 bg-white/[0.04] p-8"
							>
								<Icon className="h-8 w-8 text-brand" />
								<div>
									<div className="num text-4xl font-black text-white md:text-5xl">
										{card.stat}
									</div>
									<h3 className="mb-2 mt-1 text-lg font-semibold text-white">
										{card.label}
									</h3>
									<p className="text-sm leading-relaxed text-white/60">
										{card.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
